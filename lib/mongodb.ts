import 'server-only';
import mongoose, { ConnectOptions, Mongoose } from 'mongoose';

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // Use a dedicated global cache key to survive hot reloads in development.
  var mongooseCache: MongooseCache | undefined;
}

// Reuse the same cache object across module reloads.
const cached = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

/**
 * Connect to MongoDB with Mongoose and reuse the connection across requests.
 * This avoids opening multiple connections during development HMR.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('Missing MONGODB_URI. Add it to your environment variables.');
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongodbUri, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the cached promise so future calls can retry cleanly.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
