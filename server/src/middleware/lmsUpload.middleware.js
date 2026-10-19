const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Base uploads directory
const baseUploadsDir = path.join(__dirname, '../../uploads');
const materialsDir = path.join(baseUploadsDir, 'lms/materials');
const assignmentsDir = path.join(baseUploadsDir, 'lms/assignments');

[materialsDir, assignmentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage for LMS Materials
const materialsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, materialsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// Configure disk storage for LMS Assignment Submissions
const assignmentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assignmentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `sub-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MATERIAL_EXTS = new Set([
  '.pdf', '.docx', '.doc', '.pptx', '.ppt', '.zip', '.tar', '.gz',
  '.txt', '.py', '.java', '.cpp', '.c', '.js', '.ts', '.html', '.css', '.json'
]);

const ALLOWED_ASSIGNMENT_EXTS = new Set([
  '.pdf', '.zip', '.rar', '.tar', '.gz', '.doc', '.docx',
  '.py', '.java', '.cpp', '.c', '.js', '.ts', '.txt'
]);

function createUploadMiddleware(storage, allowedExts, maxSizeMb, fieldName) {
  const upload = multer({
    storage,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExts.has(ext)) {
        return cb(
          new Error(`Unsupported file type '${ext}'. Allowed types: ${Array.from(allowedExts).join(', ')}`),
          false
        );
      }
      cb(null, true);
    },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File exceeds maximum allowed size of ${maxSizeMb}MB.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
}

const handleMaterialUpload = createUploadMiddleware(materialsStorage, ALLOWED_MATERIAL_EXTS, 25, 'file');
const handleAssignmentUpload = createUploadMiddleware(assignmentsStorage, ALLOWED_ASSIGNMENT_EXTS, 20, 'file');

module.exports = {
  handleMaterialUpload,
  handleAssignmentUpload,
};
