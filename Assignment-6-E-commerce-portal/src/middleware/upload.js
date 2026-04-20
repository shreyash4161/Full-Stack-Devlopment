const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const uploadDirectory = path.join(__dirname, "..", "..", "public", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const baseName = sanitizeFileName(path.basename(file.originalname, extension)) || "listing-image";
    callback(null, `${Date.now()}-${baseName}${extension}`);
  }
});

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const cloudinaryStorage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: async (_req, file) => ({
        folder: "resellr-marketplace",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: `${Date.now()}-${sanitizeFileName(path.basename(file.originalname, path.extname(file.originalname))) || "listing-image"}`
      })
    })
  : null;

function fileFilter(_req, file, callback) {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image files are allowed."));
}

module.exports = multer({
  storage: cloudinaryStorage || diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
