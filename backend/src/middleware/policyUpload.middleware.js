const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Dedicated directory for placement policy PDFs
const policiesDir = path.join(__dirname, '../../uploads/policies');
if (!fs.existsSync(policiesDir)) {
  fs.mkdirSync(policiesDir, { recursive: true });
}

const policyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, policiesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `policy-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const MAX_POLICY_SIZE_MB = 15;

const uploadPolicy = multer({
  storage: policyStorage,
  limits: {
    fileSize: MAX_POLICY_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdfExt = ext === '.pdf';
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';

    if (!isPdfExt || !isPdfMime) {
      const err = new Error('Invalid file format. Only official PDF documents (.pdf) are permitted for college placement policies.');
      err.code = 'INVALID_FILE_TYPE';
      return cb(err, false);
    }
    cb(null, true);
  },
});

/**
 * Express middleware for policy document uploads
 */
function handlePolicyUpload(req, res, next) {
  const uploadSingle = uploadPolicy.single('policyFile');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `Policy PDF exceeds the maximum allowed size of ${MAX_POLICY_SIZE_MB}MB.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
}

module.exports = {
  handlePolicyUpload,
  policiesDir,
};
