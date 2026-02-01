import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const replaceTargetUrl = formData.get("replaceTargetUrl") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  await ensureUploadDir();

  // Delete old file if replacing
  if (replaceTargetUrl) {
    const oldFilename = replaceTargetUrl.split("/uploads/").pop();
    if (oldFilename) {
      const oldPath = path.join(UPLOAD_DIR, oldFilename);
      try {
        await unlink(oldPath);
      } catch {
        // Old file may not exist, ignore
      }
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${randomUUID()}-${safeName}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await writeFile(filePath, buffer);

  const url = `/api/uploads/${filename}`;
  return NextResponse.json({ url });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  const filename = url.split("/uploads/").pop();
  if (!filename) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await unlink(filePath);
  } catch {
    // File may not exist, ignore
  }

  return NextResponse.json({ success: true });
}
