const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const PharmacyInventory = require('./models/PharmacyInventory');
const Prescription = require('./models/Prescription');
const HealthRecord = require('./models/HealthRecord');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to telemedicine MongoDB database');

        // Seed everything if database is fresh
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log("Database is empty. Seeding initial telemedicine data...");
            const hashedPw = await bcrypt.hash('password123', 10);

            // 1. Seed Users
            const admin = await User.create({ name: 'System Admin', email: 'admin@telemedicine.com', password: hashedPw, role: 'Admin' }); // password123
            const doctor = await User.create({ name: 'Dr. Sarah Wilson', email: 'doctor@telemedicine.com', password: hashedPw, role: 'Doctor' });
            const patient = await User.create({ 
                name: 'John Doe', 
                email: 'patient@telemedicine.com', 
                password: hashedPw, 
                role: 'Patient',
                patientId: 'PAT-123456'
            });
            const pharmOwner = await User.create({ name: 'Pharmacy Manager', email: 'pharmacy@telemedicine.com', password: hashedPw, role: 'Pharmacy' });

            // Clean slate for Pharmacy and Records.

            console.log('Seeding complete. Use admin@telemedicine.com / password123 to log in.');
        }


        // Backfill: give every Patient without a patientId a unique one
        const missing = await User.find({ role: 'Patient', $or: [{ patientId: { $exists: false } }, { patientId: null }, { patientId: '' }] });
        for (const u of missing) {
            let id, exists = true;
            while (exists) {
                id = 'PAT-' + Math.floor(100000 + Math.random() * 900000);
                exists = await User.exists({ patientId: id });
            }
            try {
                await User.updateOne({ _id: u._id }, { $set: { patientId: id } });
                console.log(`Assigned ${id} to patient ${u.email || u._id}`);
            } catch (e) {
                console.error(`Could not assign patientId to ${u.email || u._id}:`, e.message);
            }
        }

    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;