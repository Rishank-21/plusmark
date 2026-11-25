import { NextResponse } from "next/server";
import { requestAdmin } from "@/lib/server/media-auth";
import { cloudinaryConfig, destroyAsset } from "@/lib/server/cloudinary";
import { consumeRateLimit, requestKey } from "@/lib/server/rate-limit";
import { serverSupabase } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  publicId?: string;
  resourceType?: string;
}

export async function POST(request: Request) {
  if (!consumeRateLimit(requestKey(request, "media-delete"), 30, 60_000)) {
    return NextResponse.json({ error: "Too many delete requests. Wait a minute and try again." }, { status: 429 });
  }

  const admin = await requestAdmin(request);
  if (!admin.user) return admin.response;

  const body = (await request.json().catch(() => null)) as Body | null;
  const publicId = body?.publicId?.trim() ?? "";
  const resourceType = body?.resourceType?.trim() ?? "";

  if (resourceType !== "image" && resourceType !== "video") {
    return NextResponse.json({ error: "Choose an image or a video asset." }, { status: 400 });
  }

  const config = cloudinaryConfig();
  /* Only assets under this project's folder may be deleted, so a stray or
     malicious public_id cannot touch unrelated Cloudinary assets. */
  const allowedPrefix = `${config.baseFolder}/`;
  if (
    !publicId ||
    publicId.length > 400 ||
    !publicId.startsWith(allowedPrefix) ||
    publicId.includes("..") ||
    !/^[A-Za-z0-9/_.-]+$/.test(publicId)
  ) {
    return NextResponse.json({ error: "That media id is not valid." }, { status: 400 });
  }

  if (!config.enabled) {
    return NextResponse.json({ error: "Cloudinary is not configured on this deployment." }, { status: 503 });
  }

  try {
    const result = await destroyAsset(publicId, resourceType);
    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json({ error: "Cloudinary could not delete that asset." }, { status: 502 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The asset could not be deleted from Cloudinary." },
      { status: 502 }
    );
  }

  /* Keep Postgres in step: drop the registry row, scrub product galleries and
     clear the product video id if this asset was used there. Failures here are
     reported but the asset is already gone from Cloudinary. */
  const warnings: string[] = [];
  try {
    const db = serverSupabase();
    const { error } = await db.from("media").delete().eq("public_id", publicId);
    if (error) warnings.push("The media registry row could not be removed.");

    const { data: products, error: productError } = await db
      .from("products")
      .select("id, media")
      /* A JSON string is sent verbatim by PostgREST; an object array is mangled
         by the client and rejected with 22P02. */
      .contains("media", JSON.stringify([{ publicId }]));
    if (productError) {
      warnings.push("Product galleries could not be checked for this asset.");
    } else {
      for (const product of products ?? []) {
        const list = Array.isArray(product.media) ? product.media : [];
        const next = list.filter((entry) => {
          const item = entry as { publicId?: string } | null;
          return item?.publicId !== publicId;
        });
        const { error: updateError } = await db.from("products").update({ media: next }).eq("id", product.id);
        if (updateError) warnings.push("A product gallery still references this asset.");
      }
    }

    const { error: videoError } = await db.from("products").update({ video_id: null }).eq("video_id", publicId);
    if (videoError) warnings.push("A product video reference could not be cleared.");
  } catch {
    warnings.push("The database record could not be cleaned up.");
  }

  return NextResponse.json({ deleted: true, publicId, warnings }, { headers: { "Cache-Control": "no-store" } });
}
