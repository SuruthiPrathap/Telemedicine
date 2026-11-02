const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function migratePatientIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database for migration...');

        const patientsWithoutId = await User.find({ 
            role: 'Patient', 
            $or: [
                { patientId: { $exists: false } },
                { patientId: null },
                { patientId: '' }
            ]
        });

        console.log(`Found ${patientsWithoutId.length} patients without a patientId.`);

        for (const patient of patientsWithoutId) {
            const newId = 'PAT-' + Math.floor(100000 + Math.random() * 900000);
            patient.patientId = newId;
            await patient.save();
            console.log(`Updated patient ${patient.name} with ID: ${newId}`);
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

migratePatientIds();
