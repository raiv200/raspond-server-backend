const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucket = process.env.AWS_BUCKET_NAME || 'raspond-content';

async function uploadFile(filePath, key, contentType) {
  const fileStream = fs.createReadStream(filePath);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  try {
    await s3.send(command);
    return `s3://${bucket}/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('S3 Upload Failed');
  }
}

module.exports = { uploadFile };
