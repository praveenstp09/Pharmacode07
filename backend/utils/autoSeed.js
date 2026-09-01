import User from '../models/User.js';

// Auto-seed ONLY the official master admin if not found in database
export const autoSeedIfEmpty = async () => {
  try {
    const adminEmail = 'pharmacode07exams@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log(`🌱 Initializing official admin account (${adminEmail})...`);
      await User.create({
        name: 'PharmaCode Admin',
        email: adminEmail,
        mobile: '9336331163',
        password: 'pharmacode@&07',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`✅ Official Admin account (${adminEmail}) successfully initialized!`);
    }
  } catch (err) {
    console.error('⚠️ Admin Init Warning:', err.message);
  }
};
