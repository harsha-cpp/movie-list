'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { IMovie } from '../models/Movie';
import ImageUpload from './ImageUpload';

interface MovieFormProps {
  movie?: IMovie;
  onSubmit: (movieData: Partial<IMovie>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

export default function MovieForm({ movie, onSubmit, onCancel, isLoading = false }: MovieFormProps) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    releaseYear: movie?.releaseYear?.toString() || '',
    genre: movie?.genre || '',
    imageUrl: movie?.imageUrl || '',
    imageKey: movie?.imageKey || '',
    rating: movie?.rating?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.releaseYear) {
      newErrors.releaseYear = 'Release year is required';
    } else {
      const year = parseInt(formData.releaseYear);
      if (year < 1900 || year > new Date().getFullYear() + 5) {
        newErrors.releaseYear = 'Invalid release year';
      }
    }
    if (!formData.genre) newErrors.genre = 'Genre is required';
    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else {
      const rating = parseFloat(formData.rating);
      if (rating < 0 || rating > 10) {
        newErrors.rating = 'Rating must be between 0 and 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        releaseYear: parseInt(formData.releaseYear),
        genre: formData.genre,
        imageUrl: formData.imageUrl.trim(),
        imageKey: formData.imageKey.trim(),
        rating: parseFloat(formData.rating),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">{movie ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {movie ? 'Update the movie information below.' : 'Fill in the details to add a new movie.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter movie title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter movie description"
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseYear">Release Year</Label>
              <Input
                id="releaseYear"
                type="number"
                value={formData.releaseYear}
                onChange={(e) => handleChange('releaseYear', e.target.value)}
                placeholder="e.g. 2023"
                min="1900"
                max={new Date().getFullYear() + 5}
              />
              {errors.releaseYear && <p className="text-sm text-red-500">{errors.releaseYear}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-10)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
                placeholder="e.g. 8.5"
                min="0"
                max="10"
              />
              {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={formData.genre} onValueChange={(value) => handleChange('genre', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
          </div>

          <div className="space-y-2">
            <Label>Movie Poster</Label>
            <ImageUpload
              onImageUpload={(imageUrl, imageKey) => {
                setFormData(prev => ({ ...prev, imageUrl, imageKey }));
              }}
              currentImageUrl={formData.imageUrl}
              onRemoveImage={() => {
                setFormData(prev => ({ ...prev, imageUrl: '', imageKey: '' }));
              }}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="w-full sm:flex-1">
              {isLoading ? 'Saving...' : movie ? 'Update Movie' : 'Add Movie'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
