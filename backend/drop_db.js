const mongoose = require('mongoose');

const dropDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Telemedicine');
        console.log('Connected. Dropping database...');
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully.');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
dropDB();
