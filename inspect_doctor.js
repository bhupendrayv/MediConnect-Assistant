const mongoose = require('mongoose');
const User = require('./server/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Connected');
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkDoctor = async () => {
    await connectDB();
    try {
        // ID from the browser URL
        const doctor = await User.findById('6947b238f7448c96636091ed');
        console.log('Doctor Data:', JSON.stringify(doctor, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkDoctor();
