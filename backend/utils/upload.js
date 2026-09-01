import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { fileTypeFromFile } from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials provided in .env
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local uploads directory fallback
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `doc-${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  // BOTH extension AND declared MIME type must match
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, PNG, and WebP files are allowed!'), false);
  }
};

const maxFileSizeMB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 15;

export const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeMB * 1024 * 1024 }, // 15MB max file size
  fileFilter,
});

// Helper function to upload file to Cloudinary with local fallback + magic byte verification
export const uploadToCloudinaryOrLocal = async (file, folder = 'pharmacode_docs') => {
  const cleanFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '') || 'pharmacode_docs';

  // 1. Magic byte verification
  try {
    const detectedType = await fileTypeFromFile(file.path);
    const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    // Note: Some standard plain text/PDFs might have specific headers, allow if matches PDF/image
    if (detectedType && !allowedMime.includes(detectedType.mime)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      throw new Error(`File content (${detectedType.mime}) does not match allowed file types.`);
    }
  } catch (magicErr) {
    if (magicErr.message.includes('File content')) {
      throw magicErr;
    }
    // If magic byte detection on text-based PDF is inconclusive, proceed with caution
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const isPdf =
        file.originalname.toLowerCase().endsWith('.pdf') ||
        file.mimetype === 'application/pdf';

      const uploadOptions = {
        folder: cleanFolder,
        resource_type: isPdf ? 'raw' : 'auto',
        type: 'upload',
      };

      if (isPdf) {
        const cleanName = path
          .parse(file.originalname)
          .name.replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 50);
        uploadOptions.public_id = `${cleanName}-${Date.now()}.pdf`;
      }

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);

      // Remove temporary local file after successful cloud upload
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format || 'pdf',
        size: file.size,
      };
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local storage:', err.message);
    }
  }

  // Fallback to local static URL
  return {
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
  };
};
