const multer = require('multer');
const path = require('path');

// Memory storage to process in-memory and avoid lingering disk artifacts
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream', // Some browsers send docx/pdf as octet-stream
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Unsupported file extension '${ext}'. Only PDF (.pdf) and Word documents (.docx, .doc) are permitted.`),
      false
    );
  }

  // Validate declared MIME type
  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error(`Unsupported file type '${file.mimetype}'. Please upload a standard PDF or Word document.`),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
});

/**
 * Express wrapper for safe error formatting
 */
function handleResumeUpload(req, res, next) {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Resume file exceeds the maximum 5MB size limit. Please upload a smaller document.',
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume document provided. Please attach a PDF or DOCX file to analyze.',
      });
    }

    next();
  });
}

module.exports = { handleResumeUpload };
