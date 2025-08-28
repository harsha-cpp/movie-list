import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../../lib/mongodb';
import Wishlist from '../../../../models/Wishlist';
import { authOptions } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    let query = {};
    if (movieId) {
      query = { movieId };
    }

    const wishlistData = await Wishlist.find(query)
      .populate('userId', 'name email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json(wishlistData);
  } catch (error) {
    console.error('Error fetching wishlist data:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist data' }, { status: 500 });
  }
}
