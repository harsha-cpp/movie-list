'use client';

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Spinner } from './ui/spinner';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, imageKey: string) => void;
  currentImageUrl?: string;
  onRemoveImage?: () => void;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  currentImageUrl,
  onRemoveImage,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { imageUrl, imageKey } = await response.json();
      onImageUpload(imageUrl, imageKey);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };



  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={currentImageUrl}
                  alt="Current poster"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Current Poster</p>
                <p className="text-xs text-gray-500">Image uploaded successfully</p>
              </div>
              {onRemoveImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemoveImage}
                  disabled={disabled || uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled && !uploading ? openFileDialog : undefined}
      >
        <CardContent className="p-8">
          <div className="text-center">
            {uploading ? (
              <div className="space-y-4">
                <Spinner size="lg" />
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Movie Poster
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop an image file here, or click to select
                </p>
                <div className="text-xs text-gray-500">
                  <p>Supported formats: JPEG, PNG, WebP</p>
                  <p>Maximum size: 5MB</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
}
