/**
 * CampusCorp S3 Storage Service
 * 
 * Provides unified file storage abstraction:
 * - If AWS_S3_BUCKET is configured, stores and retrieves files from Amazon S3.
 * - If AWS_S3_BUCKET is not configured, transparently falls back to local filesystem storage.
 * 
 * Preserves 100% backward compatibility with all existing multer workflows.
 */

const fs = require('fs');
const path = require('path');

const isS3Enabled = Boolean(process.env.AWS_S3_BUCKET);
let s3Client = null;

if (isS3Enabled) {
  try {
    const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  } catch (err) {
    console.warn('[STORAGE] @aws-sdk/client-s3 not installed; falling back to local storage.');
  }
}

/**
 * Upload a file to S3 or local storage
 * @param {object} params
 * @param {string} params.filePath - Local temporary file path
 * @param {string} params.key - Relative destination key (e.g. 'policies/code_of_conduct.pdf')
 * @param {string} params.contentType - MIME type
 * @returns {Promise<{ url: string, key: string, storage: 's3'|'local' }>}
 */
async function uploadFile({ filePath, key, contentType }) {
  if (isS3Enabled && s3Client) {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const fileStream = fs.createReadStream(filePath);
    const bucket = process.env.AWS_S3_BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType || 'application/octet-stream',
    });

    await s3Client.send(command);

    // Return S3 object reference or public/CDN URL
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    const publicUrl = cloudfrontDomain
      ? `https://${cloudfrontDomain}/${key}`
      : `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      url: publicUrl,
      key,
      storage: 's3',
    };
  }

  // Local storage fallback
  const baseUploadDir = path.join(__dirname, '../../uploads');
  const targetPath = path.join(baseUploadDir, key);
  const targetDir = path.dirname(targetPath);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (filePath !== targetPath) {
    fs.copyFileSync(filePath, targetPath);
  }

  return {
    url: `/uploads/${key.replace(/\\/g, '/')}`,
    key,
    storage: 'local',
  };
}

/**
 * Generate a pre-signed download URL for private documents
 * @param {string} key
 * @param {number} expiresInSeconds
 * @returns {Promise<string>}
 */
async function getDownloadUrl(key, expiresInSeconds = 3600) {
  if (isS3Enabled && s3Client) {
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  return `/uploads/${key.replace(/\\/g, '/')}`;
}

module.exports = {
  isS3Enabled,
  uploadFile,
  getDownloadUrl,
};
