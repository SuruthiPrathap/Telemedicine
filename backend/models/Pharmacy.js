const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    address: String,
    stockStatus: { type: String, default: 'In Stock' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
});

PharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', PharmacySchema);
