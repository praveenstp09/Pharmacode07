import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import FolderItem from '../models/FolderItem.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import StudyMaterial from '../models/StudyMaterial.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import Order from '../models/Order.js';
import Purchase from '../models/Purchase.js';
import Coupon from '../models/Coupon.js';
import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';
import StudyPack from '../models/StudyPack.js';
import StudyPackItem from '../models/StudyPackItem.js';

dotenv.config();

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';

const resetAndSeedAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB:', MONGO_URI);
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ Connected to: ${conn.connection.host} (Database: ${conn.connection.name})`);

    console.log('🧹 Wiping all previous mock data across all 13 collections...');
    await Promise.all([
      User.deleteMany({}),
      TestSeries.deleteMany({}),
      FolderItem.deleteMany({}),
      TestPaper.deleteMany({}),
      TestAttempt.deleteMany({}),
      StudyMaterial.deleteMany({}),
      SingleModelPaper.deleteMany({}),
      NonPharmaResource.deleteMany({}),
      Order.deleteMany({}),
      Purchase.deleteMany({}),
      Coupon.deleteMany({}),
      Contact.deleteMany({}),
      Notification.deleteMany({}),
      StudyPack.deleteMany({}),
      StudyPackItem.deleteMany({}),
    ]);
    console.log('✅ Database wiped cleanly! 0 mock items remaining.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('ℹ️ No ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD provided in .env. Skipping admin creation.');
      console.log('🎉 Database wiped cleanly and ready for production!');
      process.exit(0);
    }

    console.log(`👤 Seeding Admin account (${adminEmail})...`);

    const admin = await User.create({
      name: 'PharmaCode Admin',
      email: adminEmail.toLowerCase().trim(),
      mobile: process.env.ADMIN_MOBILE || '',
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
    });

    console.log(`✅ Master Admin created successfully:`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Verified: ${admin.isEmailVerified}`);
    console.log('🎉 Database is 100% clean and ready for production!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Reset & Seed Error:', err.message);
    process.exit(1);
  }
};

resetAndSeedAdmin();
