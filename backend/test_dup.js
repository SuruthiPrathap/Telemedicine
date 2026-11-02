const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Telemedicine');
        await User.create({ name: 'Test1', email: 'test1@test.com', password: 'abc', role: 'Doctor' });
        await User.create({ name: 'Test2', email: 'test2@test.com', password: 'abc', role: 'Pharmacy' });
        console.log("Success");
    } catch(err) {
        console.error("ERROR", err.message);
    }
    process.exit(0);
}
test();
