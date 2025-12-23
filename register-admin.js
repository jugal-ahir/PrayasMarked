const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
require('dotenv').config();

async function registerFirstAdmin() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/animal_care_ngo';

    // EDIT THESE VALUES
    const name = "Admin User";
    const email = "vaghmashijugal@gmail.com";
    const password = "Jugal@ngo";
    const role = "admin";

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists!');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({ name, email, passwordHash, role });

        console.log(`Success! User ${email} registered as ${role}.`);
        console.log('You can now log in with these credentials.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

registerFirstAdmin();
