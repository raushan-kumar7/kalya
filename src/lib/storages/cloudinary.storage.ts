import { v2 as cloudinary } from "cloudinary";
import type { ConfigOptions, UploadApiOptions, TransformationOptions } from "cloudinary";
import type { StorageProvider, UploadOptions, UploadResult } from "./types";
import { optimizeImage } from "./optimize";

export class CloudinaryStorage implements StorageProvider {
  private readonly baseFolder: string;
  private readonly defaultTransformations: TransformationOptions[];

  constructor(
    config: ConfigOptions,
    baseFolder: string = "",
    defaultTransformations: TransformationOptions[] = []
  ) {
    cloudinary.config(config);
    this.baseFolder = baseFolder;
    this.defaultTransformations = defaultTransformations;
  }

  async upload(file: Buffer, { filename, folder, optimize }: UploadOptions): Promise<UploadResult> {
    let buffer = file;
    let finalFilename = filename;

    if (optimize) {
      const optimized = await optimizeImage(file, optimize);
      buffer = optimized.buffer;
      finalFilename = `${filename.replace(/\.[^/.]+$/, "")}.${optimized.extension}`;
    }

    return new Promise((resolve, reject) => {
      const uploadPath = this.baseFolder ? `${this.baseFolder}/${folder}` : folder;
      const options: UploadApiOptions = {
        folder: uploadPath,
        public_id: finalFilename.replace(/\.[^/.]+$/, ""),
        resource_type: optimize ? "image" : "auto",
      };

      if (this.defaultTransformations.length > 0) {
        options.transformation = this.defaultTransformations;
      }

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Upload failed"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      });

      stream.end(buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
