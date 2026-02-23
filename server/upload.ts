import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

// Check if we're on Vercel
const isVercel = process.env.VERCEL === "1";
const BLOB_STORE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Local storage setup (for development)
let uploadsDir: string | null = null;
if (!isVercel) {
  uploadsDir = path.resolve(import.meta.dirname, "..", "attached_assets", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
  } else {
    console.log(`Uploads directory exists: ${uploadsDir}`);
  }
}

// Configure multer storage based on environment
const storage = isVercel
  ? multer.memoryStorage() // Use memory storage on Vercel, we'll upload to Blob
  : multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir!);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const uniqueName = `${Date.now()}_${randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

// File filter - only allow images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/svg+xml"
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, ICO, SVG)"));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Helper to upload file to Vercel Blob Storage
async function uploadToBlob(file: Express.Multer.File): Promise<string> {
  if (!BLOB_STORE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set");
  }

  const ext = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}_${randomUUID()}${ext}`;
  const blob = await put(filename, file.buffer, {
    access: "public",
    token: BLOB_STORE_TOKEN,
    contentType: file.mimetype,
  });

  return blob.url;
}

// Helper to get the public URL for an uploaded file
export async function getImageUrl(filenameOrBuffer: string | Buffer, file?: Express.Multer.File): Promise<string> {
  if (isVercel && file) {
    // On Vercel, upload to Blob Storage
    return await uploadToBlob(file);
  }
  // Local development - return relative path
  return `/attached_assets/uploads/${filenameOrBuffer as string}`;
}

// Helper to delete an uploaded file
export async function deleteImage(urlOrFilename: string): Promise<boolean> {
  try {
    if (isVercel) {
      // On Vercel, delete from Blob Storage
      if (!BLOB_STORE_TOKEN) {
        console.error("BLOB_READ_WRITE_TOKEN not set, cannot delete from Blob Storage");
        return false;
      }
      // Extract blob key from URL
      const url = new URL(urlOrFilename);
      const key = url.pathname.split("/").pop();
      if (key) {
        await del(key, { token: BLOB_STORE_TOKEN });
        return true;
      }
      return false;
    } else {
      // Local development - delete from filesystem
      const filePath = path.join(uploadsDir!, urlOrFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Helper to extract filename from URL
export function extractFilenameFromUrl(url: string): string | null {
  if (isVercel) {
    // For Vercel Blob URLs, extract the key
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split("/").pop() || null;
    } catch {
      return null;
    }
  }
  // For local URLs
  const match = url.match(/\/attached_assets\/uploads\/([^/?]+)/);
  return match ? match[1] : null;
}
