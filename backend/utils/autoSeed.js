import User from '../models/User.js';

// Auto-seed admin account only if ADMIN_INITIAL_PASSWORD is provided in environment variables
export const autoSeedIfEmpty = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (!adminEmail || !adminPassword) {
      // Skip auto-seeding if credentials are not explicitly set in .env
      return;
    }

    const adminExists = await User.findOne({ email: adminEmail.toLowerCase().trim() });

    if (!adminExists) {
      console.log(`🌱 Initializing admin account (${adminEmail})...`);
      await User.create({
        name: 'PharmaCode Admin',
        email: adminEmail.toLowerCase().trim(),
        mobile: process.env.ADMIN_MOBILE || '',
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`✅ Admin account (${adminEmail}) initialized from environment variables.`);
    }
  } catch (err) {
    console.error('⚠️ Admin Init Warning:', err.message);
  }
};
