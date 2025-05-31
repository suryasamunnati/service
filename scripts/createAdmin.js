require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminUser = await User.create({
      name: process.argv[2],
      email: process.argv[3],
      phone: process.argv[4],
      password: process.argv[5],
      isAdmin: true
    });

    console.log('Admin user created successfully:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

if (process.argv.length < 6) {
  console.log('Usage: node createAdmin.js "Admin Name" "admin@email.com" "phone" "password"');
  process.exit(1);
}

createAdmin();