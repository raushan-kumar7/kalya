import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { StorageProvider, UploadOptions, UploadResult } from "./types";
import { optimizeImage } from "./optimize";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export class LocalStorage implements StorageProvider {
  private readonly uploadRoot: string;

  constructor(uploadRoot: string = UPLOAD_ROOT) {
    this.uploadRoot = uploadRoot;
  }

  async upload(file: Buffer, { filename, folder, optimize }: UploadOptions): Promise<UploadResult> {
    const dir = path.join(this.uploadRoot, folder);
    await mkdir(dir, { recursive: true });

    let buffer = file;
    let finalFilename = filename;

    if (optimize) {
      const optimized = await optimizeImage(file, optimize);
      buffer = optimized.buffer;
      finalFilename = `${filename.replace(/\.[^/.]+$/, "")}.${optimized.extension}`;
    }

    const safeName = `${Date.now()}-${finalFilename.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    await writeFile(path.join(dir, safeName), buffer);

    return {
      url: `/uploads/${folder}/${safeName}`,
      publicId: `${folder}/${safeName}`,
    };
  }

  async delete(publicId: string): Promise<void> {
    try {
      await unlink(path.join(this.uploadRoot, publicId));
    } catch {}
  }
}
