import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../../lib/mongodb';
import Movie from '../../../../models/Movie';
import Wishlist from '../../../../models/Wishlist';
import { authOptions } from '../../../../lib/auth';
import { deleteImageFromS3 } from '../../../../lib/s3';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const body = await request.json();
    const { title, description, releaseYear, genre, imageUrl, imageKey, rating } = body;

    const currentMovie = await Movie.findById(id);
    if (!currentMovie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    if (currentMovie.imageUrl && imageUrl && currentMovie.imageUrl !== imageUrl) {
      try {
        await deleteImageFromS3(currentMovie.imageUrl);
      } catch (error) {
        console.error('Error deleting old image from S3:', error);
      }
    }

    const movie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        description,
        releaseYear: parseInt(releaseYear),
        genre,
        imageUrl: imageUrl || '',
        imageKey: imageKey || '',
        rating: parseFloat(rating),
      },
      { new: true }
    );

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movieWithStringId = {
      ...movie.toObject(),
      _id: movie._id.toString()
    };

    return NextResponse.json(movieWithStringId);
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const movie = await Movie.findById(id);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    if (movie.imageUrl) {
      try {
        await deleteImageFromS3(movie.imageUrl);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
      }
    }

    await Movie.findByIdAndDelete(id);

    const wishlistResult = await Wishlist.deleteMany({ movieId: id });

    return NextResponse.json({ 
      message: 'Movie deleted successfully',
      wishlistItemsDeleted: wishlistResult.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
