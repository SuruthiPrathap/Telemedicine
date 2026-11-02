const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_name: String,
    medicines: String,
    dosage: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
