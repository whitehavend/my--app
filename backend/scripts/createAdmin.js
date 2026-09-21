require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const [email, password, username = 'admin', fullName = 'Platform Administrator'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> [username] [full name]');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI must be configured before creating an admin account.');
  process.exit(1);
}

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.isApproved = true;
    existingUser.password = await bcrypt.hash(password, 10);
    await existingUser.save();
    console.log(`Updated ${normalizedEmail} as an admin.`);
  } else {
    await User.create({
      firstName: fullName.trim().split(/\s+/)[0],
      secondName: fullName.trim().split(/\s+/).slice(1).join(' ') || 'Admin',
      fullName: fullName.trim(),
      username: username.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      isApproved: true,
    });
    console.log(`Created admin account for ${normalizedEmail}.`);
  }

  await mongoose.disconnect();
};

createAdmin().catch(async (error) => {
  console.error(`Unable to create admin: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});