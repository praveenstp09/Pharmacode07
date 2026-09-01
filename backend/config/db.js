import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 lookup first to prevent 20-30s DNS hangs on Windows
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Not supported in older node versions
}

let mongod = null;

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';

  // Handle Mongoose connection events
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting automatic reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error event:', err.message);
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 25,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error (${error.message}). Starting built-in MongoDB engine...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'pharmacode07',
        },
      });
      const inMemoryUri = mongod.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ Built-in MongoDB engine running & connected at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error(`❌ Failed to start built-in MongoDB engine: ${memErr.message}`);
    }
  }
};

export default connectDB;
