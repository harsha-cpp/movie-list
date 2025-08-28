import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = 'moviesdb-bucket';
const FOLDER_PREFIX = 'movie-posters/';
const AWS_REGION = process.env.AWS_REGION || 'ap-south-2';

// Upload image to S3
export async function uploadImageToS3(file: Buffer, filename: string, contentType: string): Promise<string> {
  const fileExtension = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const key = `${FOLDER_PREFIX}${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Remove ACL to avoid public access issues
  });

  try {
    await s3Client.send(command);
    
    // Return the S3 key instead of a signed URL
    // We'll generate signed URLs on-demand when displaying images
    return key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    console.error('S3 Error Details:', {
      bucket: BUCKET_NAME,
      key,
      region: AWS_REGION,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error(`Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete image from S3
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Extract the key from the full S3 URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Don't throw error for deletion failures to avoid breaking the main operation
  }
}

// Generate signed URL for viewing an image
export async function getSignedImageUrl(imageKey: string): Promise<string> {
  const getObjectCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: imageKey,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { 
      expiresIn: 7 * 24 * 60 * 60 // 7 days (AWS maximum)
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate image URL');
  }
}

// Generate presigned URL for direct upload (alternative approach)
export async function generatePresignedUrl(filename: string, contentType: string): Promise<{ url: string; key: string }> {
  const fileExtension = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const key = `${FOLDER_PREFIX}${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    return { url, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}
