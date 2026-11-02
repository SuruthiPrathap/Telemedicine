const mongoose = require('mongoose');
const User = require('./models/User');
const HealthRecord = require('./models/HealthRecord');
require('dotenv').config();

const test = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Telemedicine');
        
        // Find doctor
        const doc = await User.findOne({ role: 'Doctor' });
        console.log("Doctor:", doc.name);

        // Find patient
        const p = await User.findOne({ role: 'Patient' });
        console.log("Patient:", p.name, "PatientId:", p.patientId);

        // Simulate doctor creating health record
        const pUser = await User.findOne({ patientId: p.patientId, role: 'Patient' });
        console.log("Found pUser?", !!pUser);

        const h = await HealthRecord.create({
            patient_id: pUser ? pUser._id : new mongoose.Types.ObjectId(),
            document_path: 'uploaded_file.pdf',
            details: 'Test details'
        });
        console.log("Created Health Record:", h._id);

    } catch (err) {
        console.error("ERROR", err);
    }
    process.exit(0);
}
test();
