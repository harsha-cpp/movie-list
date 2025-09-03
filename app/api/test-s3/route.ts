import { NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing S3 connection...');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
    console.log('AWS_REGION:', process.env.AWS_REGION);

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    console.log('Testing list buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResult = await s3Client.send(listCommand);
    console.log('Available buckets:', listResult.Buckets?.map(b => b.Name));

    console.log('Testing bucket access...');
    const headCommand = new HeadBucketCommand({ Bucket: 'moviesdb-bucket' });
    await s3Client.send(headCommand);
    console.log('moviesdb-bucket is accessible');

    return NextResponse.json({
      success: true,
      message: 'S3 connection successful',
      buckets: listResult.Buckets?.map(b => b.Name) || [],
      targetBucket: 'moviesdb-bucket',
      region: process.env.AWS_REGION || 'ap-south-2'
    });

  } catch (error) {
    console.error('S3 Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        region: process.env.AWS_REGION || 'ap-south-2',
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
      }
    }, { status: 500 });
  }
}
