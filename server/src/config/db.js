import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staymate_ai';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Warning] The application will continue running, but database operations will fail until MongoDB is accessible.`);
    return null;
  }
};

export default connectDB;
