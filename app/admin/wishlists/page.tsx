'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '../../../components/AdminGuard';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { LoadingPage } from '../../../components/ui/spinner';
import { IMovie } from '../../../models/Movie';

interface WishlistEntry {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  movieId: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

export default function AdminWishlistsPage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [wishlistData, setWishlistData] = useState<WishlistEntry[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchWishlistData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchWishlistData();
  }, [selectedMovieId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchWishlistData = async () => {
    try {
      const url = selectedMovieId === 'all' 
        ? '/api/admin/wishlists' 
        : `/api/admin/wishlists?movieId=${selectedMovieId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch wishlist data');
      const data = await response.json();
      setWishlistData(data);
    } catch (error) {
      setError('Failed to load wishlist data');
      console.error('Error fetching wishlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovieWishlistCount = (movieId: string) => {
    return wishlistData.filter(entry => entry.movieId._id === movieId).length;
  };

  const getUniqueMoviesWithCounts = () => {
    const movieCounts = new Map();
    
    wishlistData.forEach(entry => {
      const movieId = entry.movieId._id;
      const count = movieCounts.get(movieId) || 0;
      movieCounts.set(movieId, count + 1);
    });

    return movies.map(movie => ({
      ...movie,
      wishlistCount: movieCounts.get(movie._id) || 0,
    })).sort((a, b) => b.wishlistCount - a.wishlistCount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminGuard>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Wishlist Analytics</h1>
        </div>

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Movie Filter */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Filter by Movie</h2>
          </div>
          <div>
            <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a movie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movies</SelectItem>
                {movies.map((movie) => (
                  <SelectItem key={movie._id} value={movie._id}>
                    {movie.title} ({getMovieWishlistCount(movie._id)} users)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Movie Popularity Overview */}
        {selectedMovieId === 'all' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Movie Popularity</h2>
            </div>
            <div className="transition-all duration-300 ease-in-out">
              {loading ? (
                <div className="overflow-x-auto rounded-lg border bg-white min-h-[400px]">
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">Loading movie popularity...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border bg-white">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Movie</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Wishlist Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getUniqueMoviesWithCounts().map((movie) => (
                        <TableRow key={movie._id}>
                          <TableCell className="font-medium">{movie.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{movie.genre}</Badge>
                          </TableCell>
                          <TableCell>{movie.releaseYear}</TableCell>
                          <TableCell>
                            <Badge variant={movie.wishlistCount > 0 ? "default" : "outline"}>
                              {movie.wishlistCount} users
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Wishlist Entries */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {selectedMovieId === 'all' 
                ? `All Wishlist Entries (${wishlistData.length})`
                : `Users who wishlisted this movie (${wishlistData.length})`
              }
            </h2>
          </div>
          <div className="transition-all duration-300 ease-in-out">
            {loading ? (
              <div className="overflow-x-auto rounded-lg border bg-white min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Loading wishlist data...</p>
                </div>
              </div>
            ) : wishlistData.length === 0 ? (
              <div className="overflow-x-auto rounded-lg border bg-white min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <p>
                    {selectedMovieId === 'all' 
                      ? 'No movies have been added to wishlists yet.'
                      : 'No users have added this movie to their wishlist yet.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      {selectedMovieId === 'all' && <TableHead>Movie</TableHead>}
                      <TableHead>Added On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wishlistData.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="font-medium">{entry.userId.name}</TableCell>
                        <TableCell>{entry.userId.email}</TableCell>
                        {selectedMovieId === 'all' && (
                          <TableCell>{entry.movieId.title}</TableCell>
                        )}
                        <TableCell>{formatDate(entry.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
