'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MovieCard from '../../components/MovieCard';
import { IMovie } from '../../models/Movie';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { LoadingPage } from '../../components/ui/spinner';

interface WishlistItem {
  _id: string;
  movieId: IMovie | null;
  createdAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      // Filter out wishlist items with null or missing movieId
      const validItems = data.filter((item: WishlistItem) => item.movieId && item.movieId._id);
      setWishlistItems(validItems);
    } catch (error) {
      setError('Failed to load your wishlist');
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (movieId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from wishlist');
      }

      setWishlistItems(prev => prev.filter(item => item.movieId && item.movieId._id !== movieId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  if (status === 'loading') {
    return <LoadingPage>Loading your wishlist...</LoadingPage>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">My Wishlist</h1>
        <p className="text-sm sm:text-base text-gray-600">{loading ? '...' : `${wishlistItems.length} movies in your wishlist`}</p>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 min-h-[400px] sm:min-h-[600px]">
          <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900 mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading your wishlist...</p>
          </div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 min-h-[400px] sm:min-h-[600px]">
          <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
            <p className="text-gray-500 text-sm sm:text-base">Your wishlist is empty.</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Browse movies and add them to your wishlist to see them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 transition-all duration-300 ease-in-out">
          {wishlistItems
            .filter((item) => item.movieId) // Additional safety check
            .map((item) => (
              <MovieCard
                key={item._id}
                movie={item.movieId as IMovie}
                isInWishlist={true}
                onWishlistToggle={(movieId) => handleRemoveFromWishlist(movieId)}
                showWishlistButton={true}
              />
            ))}
        </div>
      )}
    </div>
  );
}
