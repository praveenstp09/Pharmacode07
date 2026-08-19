import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';

const runVerification = async () => {
  console.log('🧪 Connecting to MongoDB:', MONGO_URI.replace(/:[^:]*@/, ':****@'));

  try {
    const conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ 1. MongoDB Connected successfully to host: ${conn.connection.host}`);

    const seriesList = await TestSeries.find();
    console.log(`✅ 2. Test Series in DB: ${seriesList.length} items`);

    const users = await User.find();
    console.log(`✅ 3. Users in DB: ${users.length} users`);

    console.log('\n🎉 ALL CHECKS PASSED ON MONGODB ATLAS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Error:', error.message);
    process.exit(1);
  }
};

runVerification();
