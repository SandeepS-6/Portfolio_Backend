import multer from "multer";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../middlewares/errorHandler.js";
import { ensureUploadsDir, uploadsDir } from "../config/uploads.js";

ensureUploadsDir();

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || "";
    const base = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "file";
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(httpError(400, "Only images (JPEG, PNG, WebP, GIF, SVG) or PDF allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");

export const postUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw httpError(400, "No file uploaded — use form field name \"file\"");
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});
