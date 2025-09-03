import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
  imageUrl?: string; 
  imageKey?: string; 
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  imageKey: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
