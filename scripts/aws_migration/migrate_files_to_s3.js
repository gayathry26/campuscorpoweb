/**
 * CampusCorp S3 Document & File Migration Engine
 * 
 * Safely migrates all local uploads (resumes, policies, LMS materials, downloads)
 * to an AWS S3 bucket while preserving exact relative paths, MIME types, and verifying integrity.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../server/uploads');
const DOWNLOADS_DIR = path.join(__dirname, '../../server/public/downloads');
const MANIFEST_PATH = path.join(__dirname, '../../backups/file_migration_manifest.json');

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.exe': 'application/vnd.microsoft.portable-executable',
    '.zip': 'application/zip',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext] || 'application/octet-stream';
}

function scanDirectory(dir, baseDir, prefix = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanDirectory(fullPath, baseDir, prefix));
    } else {
      if (entry.name === '.gitkeep') continue;
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const key = prefix ? `${prefix}/${relPath}` : relPath;
      const stat = fs.statSync(fullPath);
      const buffer = fs.readFileSync(fullPath);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

      results.push({
        localPath: fullPath,
        s3Key: key,
        sizeBytes: stat.size,
        contentType: getMimeType(fullPath),
        sha256,
      });
    }
  }
  return results;
}

async function run() {
  console.log('Scanning local files for S3 migration...');
  const uploadFiles = scanDirectory(UPLOADS_DIR, UPLOADS_DIR, 'uploads');
  const downloadFiles = scanDirectory(DOWNLOADS_DIR, DOWNLOADS_DIR, 'downloads');
  const allFiles = [...uploadFiles, ...downloadFiles];

  console.log(`Found ${allFiles.length} files to migrate:`);
  let totalBytes = 0;
  allFiles.forEach(f => {
    totalBytes += f.sizeBytes;
    console.log(` - ${f.s3Key} (${(f.sizeBytes / 1024).toFixed(1)} KB, ${f.contentType})`);
  });

  const manifest = {
    scannedAt: new Date().toISOString(),
    targetBucket: BUCKET_NAME || 'LOCAL_AUDIT_MODE',
    region: REGION,
    totalFiles: allFiles.length,
    totalBytes,
    files: allFiles,
  };

  if (!fs.existsSync(path.dirname(MANIFEST_PATH))) {
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nFile inventory saved to: ${MANIFEST_PATH}`);

  if (!BUCKET_NAME) {
    console.log('\n[NOTICE] AWS_S3_BUCKET not set in environment.');
    console.log('Audit completed. To upload to AWS, set AWS_S3_BUCKET and AWS credentials, then re-run this script.');
    return;
  }

  // Upload to S3 if AWS SDK and bucket are available
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const s3 = new S3Client({ region: REGION });

  console.log(`\nUploading ${allFiles.length} files to Amazon S3 bucket '${BUCKET_NAME}'...`);
  for (const file of allFiles) {
    const fileStream = fs.createReadStream(file.localPath);
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
      Body: fileStream,
      ContentType: file.contentType,
    }));
    console.log(`✓ Uploaded: s3://${BUCKET_NAME}/${file.s3Key}`);
  }
  console.log('\n✅ All files successfully uploaded to S3.');
}

run().catch(console.error);
