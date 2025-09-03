import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  try {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      family: 4,
      tls: true,
      tlsAllowInvalidCertificates: true,
      retryWrites: true,
      retryReads: true,
    };

    const db = await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    isConnected = false;
    throw error;
  }
}

export default connectDB;
