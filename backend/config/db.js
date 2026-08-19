import mongoose from 'mongoose';
import dns from 'dns';

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if already set
}

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
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
