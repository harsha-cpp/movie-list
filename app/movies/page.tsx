'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MovieCard from '../../components/MovieCard';
import { IMovie } from '../../models/Movie';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { LoadingPage } from '../../components/ui/spinner';

export default function MoviesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMovies();
      fetchWishlist();
    }
  }, [session]);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      setError('Failed to load movies');
      console.error('Error fetching movies:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      const movieIds = data
        .filter((item: { movieId: { _id: string } | null }) => item.movieId && item.movieId._id)
        .map((item: { movieId: { _id: string } }) => item.movieId._id);
      setWishlist(movieIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (movieId: string, isAdding: boolean) => {
    try {
      const method = isAdding ? 'POST' : 'DELETE';
      const response = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update wishlist');
      }

      if (isAdding) {
        setWishlist(prev => [...prev, movieId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== movieId));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      throw error;
    }
  };

  if (status === 'loading') {
    return <LoadingPage>Loading movies...</LoadingPage>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-6 w-full transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Movies</h1>
        <p className="text-gray-600">{loading ? '...' : `${movies.length} movies available`}</p>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 min-h-[600px]">
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading movies...</p>
          </div>
        </div>
      ) : movies.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 min-h-[600px]">
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <p className="text-gray-500">No movies available yet.</p>
            {session.user.isAdmin && (
              <p className="text-sm text-gray-400 mt-2">
                As an admin, you can add movies from the admin panel.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 transition-all duration-300 ease-in-out">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isInWishlist={wishlist.includes(movie._id)}
              onWishlistToggle={handleWishlistToggle}
              showWishlistButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
