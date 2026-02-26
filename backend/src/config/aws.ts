import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const s3 = new AWS.S3();

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'fluentia-recordings';

/**
 * Upload file to S3
 */
export const uploadToS3 = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'private'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * Generate presigned URL for private file access
 */
export const getPresignedUrl = (key: string, expiresIn: number = 3600): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  });
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  await s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: key
  }).promise();
};
