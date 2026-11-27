import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { consumeRateLimit, requestKey } from "@/lib/server/rate-limit";

async function verifyCallerAdmin(request: Request): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Sign in as an administrator." }, { status: 401 }) };
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: userRes, error: userErr } = await client.auth.getUser(token);
  if (userErr || !userRes.user) {
    return { ok: false, response: NextResponse.json({ error: "Sign in as an administrator." }, { status: 401 }) };
  }
  const { data: profile, error: profErr } = await client
    .from("profiles")
    .select("role")
    .eq("id", userRes.user.id)
    .maybeSingle();
  if (profErr || profile?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }) };
  }
  const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if (aal?.currentLevel !== "aal2") {
    return { ok: false, response: NextResponse.json({ error: "Two-factor verification required." }, { status: 403 }) };
  }
  return { ok: true };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProviderChoice = "auto" | "gemini" | "openai";

interface Body {
  prompt?: string;
  width?: number;
  height?: number;
  openAiSize?: "1536x1024" | "1024x1024" | "1024x1536";
  geminiAspect?: "16:9" | "4:3" | "3:4" | "1:1";
  provider?: ProviderChoice;
  apiKey?: string;
}

async function generateWithGemini(prompt: string, aspectRatio: string, apiKey: string) {
  // Try Imagen 3 endpoint first, falling back cleanly to Gemini native image generation.
  const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(imagenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio }
    }),
    signal: AbortSignal.timeout(45_000)
  });

  if (res.ok) {
    const json = (await res.json()) as {
      predictions?: { bytesBase64Encoded?: string; mimeType?: string }[];
    };
    const hit = json.predictions?.[0];
    if (hit?.bytesBase64Encoded) {
      return { base64: hit.bytesBase64Encoded, mimeType: hit.mimeType || "image/png", model: "imagen-3.0-generate-002" };
    }
  }

  const flashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(apiKey)}`;
  const flashRes = await fetch(flashUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${prompt} (Composition aspect ratio ${aspectRatio})` }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio }
      }
    }),
    signal: AbortSignal.timeout(45_000)
  });

  const flashJson = (await flashRes.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
  };
  if (!flashRes.ok) {
    throw new Error(flashJson.error?.message || `Gemini image API returned HTTP ${flashRes.status}.`);
  }
  const inline = flashJson.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) {
    throw new Error("Gemini did not return an image payload.");
  }
  return { base64: inline.data, mimeType: inline.mimeType || "image/png", model: "gemini-2.5-flash-image" };
}

async function generateWithOpenAi(prompt: string, size: string, apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1
    }),
    signal: AbortSignal.timeout(60_000)
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    data?: { b64_json?: string; url?: string }[];
  };

  if (!res.ok) {
    throw new Error(json.error?.message || `OpenAI image API returned HTTP ${res.status}.`);
  }
  const first = json.data?.[0];
  if (first?.b64_json) {
    return { base64: first.b64_json, mimeType: "image/png", model: "gpt-image-1" };
  }
  if (first?.url) {
    const imgRes = await fetch(first.url, { signal: AbortSignal.timeout(20_000) });
    if (!imgRes.ok) throw new Error("Could not download generated image URL.");
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType: imgRes.headers.get("content-type") || "image/png", model: "gpt-image-1" };
  }
  throw new Error("OpenAI did not return an image.");
}

export async function POST(request: Request) {
  if (!consumeRateLimit(requestKey(request, "hero-ai-generate"), 15, 60_000)) {
    return NextResponse.json({ error: "Too many generation requests. Wait a minute and try again." }, { status: 429 });
  }

  const auth = await verifyCallerAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as Body | null;
  const prompt = body?.prompt?.trim() ?? "";
  if (prompt.length < 5 || prompt.length > 1200) {
    return NextResponse.json({ error: "Write a prompt between 5 and 1200 characters." }, { status: 400 });
  }

  const width = Math.max(320, Math.min(2400, Math.round(Number(body?.width) || 1600)));
  const height = Math.max(320, Math.min(2400, Math.round(Number(body?.height) || 700)));
  const openAiSize = body?.openAiSize ?? (width === height ? "1024x1024" : width > height ? "1536x1024" : "1024x1536");
  const geminiAspect = body?.geminiAspect ?? (width === height ? "1:1" : width > height ? "16:9" : "3:4");

  const provider: ProviderChoice = body?.provider === "gemini" || body?.provider === "openai" ? body.provider : "auto";
  const inlineKey = body?.apiKey?.trim() || "";
  const geminiKey =
    (provider === "gemini" ? inlineKey : "") ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    (provider === "auto" && inlineKey && inlineKey.startsWith("AIza") ? inlineKey : "");
  const openAiKey =
    (provider === "openai" ? inlineKey : "") ||
    process.env.OPENAI_API_KEY?.trim() ||
    (provider === "auto" && inlineKey && !inlineKey.startsWith("AIza") ? inlineKey : "");

  if ((provider === "gemini" && !geminiKey) || (provider === "openai" && !openAiKey) || (!geminiKey && !openAiKey)) {
    return NextResponse.json(
      {
        code: "AI_NOT_CONFIGURED",
        error:
          "No AI image API key configured on the server. Add GEMINI_API_KEY or OPENAI_API_KEY to .env.local (or paste your key in the generator box for testing)."
      },
      { status: 503 }
    );
  }

  try {
    const useGemini = provider === "gemini" || (provider === "auto" && Boolean(geminiKey));
    const result = useGemini
      ? await generateWithGemini(prompt, geminiAspect, geminiKey)
      : await generateWithOpenAi(prompt, openAiSize, openAiKey);

    return NextResponse.json(
      {
        ...result,
        targetWidth: width,
        targetHeight: height
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed." },
      { status: 502 }
    );
  }
}
