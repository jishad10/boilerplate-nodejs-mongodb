import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import AppError from "../core/error/appError.js";
import { cloudinaryApiKey, cloudinaryCloudName, cloudinarySecret } from "../core/config/config.js";


cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinarySecret,
});


const DOCUMENT_EXTENSIONS = ["pdf", "docx", "doc", "xlsx", "xls", "ppt", "pptx"];

// ─── Upload ───────────

export const cloudinaryUpload = async (filePath, public_id, folder) => {
  try {
    const extension = filePath.split(".").pop()?.toLowerCase() || "";
    const isDocument = DOCUMENT_EXTENSIONS.includes(extension);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: isDocument ? "raw" : "auto",
      public_id,
      folder,
    });

    return result;
  } catch (error) {
    throw new AppError(500, error instanceof Error ? error.message : "Cloudinary upload failed");
  } finally {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }
};


// ─── Delete ──────────

export const extractPublicId = (url) => {
  const parts = url.split("/");
  if (parts.length < 2) throw new AppError(400, "Invalid Cloudinary URL");
  const fileWithExt = parts.at(-1);
  const folder = parts.at(-2);
  return `${folder}/${fileWithExt.split(".")[0]}`;
};


export const cloudinaryDelete = async (url) => {
  const publicId = extractPublicId(url);
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok") {
    throw new AppError(500, `Cloudinary deletion failed: ${result.result}`);
  }
};


export default cloudinary;