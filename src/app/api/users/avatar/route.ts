import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/constants";
import { requireSession } from "@/lib/require-session";
import { AVATAR_OPTIMIZE_PRESET, getStorage } from "@/lib/storages";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession(req);
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = getStorage();
  const result = await storage.upload(buffer, {
    filename: file.name,
    folder: `avatars/${session.user.username}`,
    optimize: AVATAR_OPTIMIZE_PRESET,
  });

  return NextResponse.json({ url: result.url, publicId: result.publicId });
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireSession(req);
  if (error) return error;

  const body = await req.json().catch(() => null);
  const publicId = body?.publicId;

  // Scope check: the publicId must live under this user's own avatars
  // folder, otherwise any signed-in user could pass an arbitrary publicId
  // and delete someone else's file.
  if (typeof publicId !== "string" || !publicId.startsWith(`avatars/${session.user.username}`)) {
    return NextResponse.json({ error: "Invalid file reference" }, { status: 400 });
  }

  const storage = getStorage();
  await storage.delete(publicId);

  return NextResponse.json({ success: true });
}
