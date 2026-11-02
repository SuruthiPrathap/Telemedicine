const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyInventory' },
        medicine_name: String,
        dosage: String,
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 }
    }],
    total_amount: { type: Number, default: 0 },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'] },
    pharmacy_name: String,
    pharmacy_address: String,
    order_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
