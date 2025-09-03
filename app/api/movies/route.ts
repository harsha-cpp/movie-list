import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../lib/mongodb';
import Movie from '../../../models/Movie';
import { authOptions } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find({}).sort({ createdAt: -1 }).lean();
    const moviesWithStringId = movies.map((movie: any) => ({
      ...movie,
      _id: movie._id.toString()
    }));
    return NextResponse.json(moviesWithStringId);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies', details: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const body = await request.json();
    const { title, description, releaseYear, genre, imageUrl, imageKey, rating } = body;

    if (!title || !description || !releaseYear || !genre || rating === undefined) {
      return NextResponse.json({ error: 'Title, description, release year, genre, and rating are required' }, { status: 400 });
    }

    const movie = await Movie.create({
      title,
      description,
      releaseYear: parseInt(releaseYear),
      genre,
      imageUrl: imageUrl || '',
      imageKey: imageKey || '',
      rating: parseFloat(rating),
    });

    const movieWithStringId = {
      ...movie.toObject(),
      _id: movie._id.toString()
    };

    return NextResponse.json(movieWithStringId, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
