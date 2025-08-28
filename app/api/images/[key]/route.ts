import { NextRequest, NextResponse } from 'next/server';
import { getSignedImageUrl } from '../../../../lib/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    
    if (!key) {
      return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
    }

    // Decode the key since it might be URL encoded
    const decodedKey = decodeURIComponent(key);
    
    // Generate a fresh signed URL
    const signedUrl = await getSignedImageUrl(decodedKey);

    return NextResponse.json({ imageUrl: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate image URL' },
      { status: 500 }
    );
  }
}
