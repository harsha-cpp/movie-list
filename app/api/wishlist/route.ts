import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../lib/mongodb';
import Wishlist from '../../../models/Wishlist';
import User from '../../../models/User';
import { authOptions } from '../../../lib/auth';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlistItems = await Wishlist.find({ userId: user._id })
      .populate('movieId')
      .sort({ createdAt: -1 });

    // Filter out items where movieId is null (deleted movies) and clean them up
    const validItems = [];
    const orphanedIds = [];

    for (const item of wishlistItems) {
      if (item.movieId) {
        validItems.push(item);
      } else {
        orphanedIds.push(item._id);
      }
    }

    // Clean up orphaned wishlist entries in the background
    if (orphanedIds.length > 0) {
      await Wishlist.deleteMany({ _id: { $in: orphanedIds } });
    }

    return NextResponse.json(validItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId: user._id, movieId });
    if (existingItem) {
      return NextResponse.json({ error: 'Movie already in wishlist' }, { status: 400 });
    }

    const wishlistItem = await Wishlist.create({
      userId: user._id,
      movieId,
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const result = await Wishlist.deleteOne({ userId: user._id, movieId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Movie not found in wishlist' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
