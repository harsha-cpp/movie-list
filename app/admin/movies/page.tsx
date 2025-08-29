'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '../../../components/AdminGuard';
import MovieForm from '../../../components/MovieForm';
import { Button } from '../../../components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';

import { IMovie } from '../../../models/Movie';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<IMovie | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      setError('Failed to load movies');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (movieData: Partial<IMovie>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add movie');
      }

      const newMovie = await response.json();
      setMovies(prev => [newMovie, ...prev]);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMovie = async (movieData: Partial<IMovie>) => {
    if (!editingMovie) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/movies/${editingMovie._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update movie');
      }

      const updatedMovie = await response.json();
      setMovies(prev => prev.map(movie => 
        movie._id === editingMovie._id ? updatedMovie : movie
      ));
      setShowEditDialog(false);
      setEditingMovie(null);
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete movie');
      }

      setMovies(prev => prev.filter(movie => movie._id !== movieId));
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const openEditDialog = (movie: IMovie) => {
    setEditingMovie(movie);
    setShowEditDialog(true);
  };

  return (
    <AdminGuard>
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Movie Management</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Movie</DialogTitle>
              </DialogHeader>
              <MovieForm
                onSubmit={handleAddMovie}
                onCancel={() => setShowAddDialog(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">All Movies ({movies.length})</h2>
          </div>
          <div className="transition-all duration-300 ease-in-out">
            {loading ? (
              <div className="overflow-x-auto rounded-lg border bg-white min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Loading movies...</p>
                </div>
              </div>
            ) : movies.length === 0 ? (
              <div className="overflow-x-auto rounded-lg border bg-white min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <p>No movies available. Add your first movie!</p>
                </div>
              </div>
            ) : (
              <div className="bg-white">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Year</TableHead>
                      <TableHead className="hidden md:table-cell">Genre</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="hidden sm:table-cell">Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.map((movie) => (
                      <TableRow key={movie._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{movie.title}</div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {movie.releaseYear} • {movie.genre} • ⭐ {movie.rating}/10
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{movie.releaseYear}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{movie.genre}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">⭐ {movie.rating}/10</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={movie.imageUrl ? "default" : "outline"}>
                            {movie.imageUrl ? "✓ Image" : "No Image"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(movie)}
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMovie(movie._id)}
                              className="text-xs"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Movie</DialogTitle>
            </DialogHeader>
            {editingMovie && (
              <MovieForm
                movie={editingMovie}
                onSubmit={handleEditMovie}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingMovie(null);
                }}
                isLoading={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
