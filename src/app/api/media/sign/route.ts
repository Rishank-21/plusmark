import { NextResponse } from "next/server";
import { requestAdmin } from "@/lib/server/media-auth";
import { cloudinaryConfig, signUpload } from "@/lib/server/cloudinary";
import { consumeRateLimit, requestKey } from "@/lib/server/rate-limit";
import { FOLDER_KIND, isMediaFolder, type MediaKind } from "@/lib/media-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  folder?: string;
  resourceType?: string;
}

export async function POST(request: Request) {
  if (!consumeRateLimit(requestKey(request, "media-sign"), 20, 60_000)) {
    return NextResponse.json({ error: "Too many upload attempts. Wait a minute and try again." }, { status: 429 });
  }

  const admin = await requestAdmin(request);
  if (!admin.user) return admin.response;

  const body = (await request.json().catch(() => null)) as Body | null;
  const folder = body?.folder?.trim() ?? "";
  const resourceType = body?.resourceType?.trim() ?? "";

  if (!isMediaFolder(folder)) {
    return NextResponse.json({ error: "That upload folder is not allowed." }, { status: 400 });
  }
  if (resourceType !== "image" && resourceType !== "video") {
    return NextResponse.json({ error: "Choose an image or a video upload." }, { status: 400 });
  }

  /* A folder only accepts its own resource type, so a video cannot be pushed
     into products/ and an image cannot be pushed into videos/. */
  const expected = FOLDER_KIND[folder];
  if (resourceType !== expected) {
    return NextResponse.json(
      { error: folder === "videos" ? "The videos folder accepts video files only." : "That folder accepts images only." },
      { status: 400 }
    );
  }

  const config = cloudinaryConfig();
  if (!config.enabled) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server." },
      { status: 503 }
    );
  }

  try {
    const signed = signUpload({
      folder,
      resourceType: resourceType as MediaKind,
      timestamp: Math.floor(Date.now() / 1000)
    });
    return NextResponse.json(signed, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The upload could not be signed." },
      { status: 500 }
    );
  }
}
