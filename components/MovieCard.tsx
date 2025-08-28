'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { IMovie } from '../models/Movie';

interface MovieCardProps {
  movie: IMovie;
  isInWishlist?: boolean;
  onWishlistToggle?: (movieId: string, isAdding: boolean) => Promise<void>;
  showWishlistButton?: boolean;
}

export default function MovieCard({ 
  movie, 
  isInWishlist = false, 
  onWishlistToggle,
  showWishlistButton = true 
}: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(movie.imageUrl || '');

  // Generate fresh signed URL if we have an imageKey but imageUrl is expired/missing
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (movie.imageKey && (!movie.imageUrl || movie.imageUrl.includes('X-Amz-Expires'))) {
        try {
          const response = await fetch(`/api/images/${encodeURIComponent(movie.imageKey)}`);
          if (response.ok) {
            const { imageUrl } = await response.json();
            setCurrentImageUrl(imageUrl);
          }
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      }
    };

    generateSignedUrl();
  }, [movie.imageKey, movie.imageUrl]);

  const handleWishlistToggle = async () => {
    if (!onWishlistToggle) return;
    
    setIsLoading(true);
    try {
      await onWishlistToggle(movie._id, !isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden pt-0 h-full flex flex-col">
      <div className="aspect-[2/3] relative bg-gray-200 flex items-center justify-center">
        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="text-gray-400 text-center p-4">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm">No Image</p>
          </div>
        )}
      </div>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">{movie.title}</CardTitle>
        <CardDescription className="text-sm">
          {movie.releaseYear} • {movie.genre} • ⭐ {movie.rating}/10
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{movie.description}</p>
        {showWishlistButton && onWishlistToggle && (
          <Button
            onClick={handleWishlistToggle}
            disabled={isLoading}
            variant={isInWishlist ? "default" : "outline"}
            className="w-full mt-auto"
            size="sm"
          >
            {isInWishlist ? (
              <>
                <Heart className="mr-2 h-4 w-4 fill-current" />
                In Wishlist
              </>
            ) : (
              <>
                <HeartOff className="mr-2 h-4 w-4" />
                Add to Wishlist
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
