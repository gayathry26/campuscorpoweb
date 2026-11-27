const multer = require('multer');
const path = require('path');

// Store upload in memory buffer for fast, secure processing without temp disk leakage
const storage = multer.memoryStorage();

const allowedExtensions = ['.csv', '.xlsx', '.xls', '.json'];
const allowedMimes = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain',
  'application/octet-stream', // Some browsers send CSVs as octet-stream
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(`Unsupported file format '${ext}'. Please upload a valid .csv, .xlsx, or .json file.`),
      false
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter,
});

module.exports = {
  handleImportUpload: upload.single('file'),
};
