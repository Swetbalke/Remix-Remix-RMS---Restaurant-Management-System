import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vortexdmas:al-S-o3-vIhjhnUOHfHNeMgz8dLiitEpKPv8UX8E98wICn@cluster0.mongodb.net/rms?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected to Atlas successfully');
  } catch (err) {
    console.warn('MongoDB Atlas connection failed, falling back to Memory Server...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('MongoDB Connected to Memory Server successfully');
  }
}
