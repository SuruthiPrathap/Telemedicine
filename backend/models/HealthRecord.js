const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    document_path: String,
    details: String,
    status: { type: String, default: 'Pending Verification' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
