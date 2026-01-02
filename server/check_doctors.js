const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Find all doctors
        const doctors = await User.find({ isDoctor: true });
        console.log(`Total doctors in database: ${doctors.length}\n`);

        // Find approved doctors (what the API returns)
        const approvedDoctors = await User.find({ isDoctor: true, status: 'approved' });
        console.log(`Approved doctors (API will return): ${approvedDoctors.length}\n`);

        if (approvedDoctors.length > 0) {
            console.log('Approved Doctors:');
            console.log('='.repeat(80));
            approvedDoctors.forEach((doc, i) => {
                console.log(`\n${i + 1}. ${doc.name}`);
                console.log(`   Email: ${doc.email}`);
                console.log(`   Gender: ${doc.gender || 'NOT SET'}`);
                console.log(`   Specialization: ${doc.specialization}`);
                console.log(`   Status: ${doc.status || 'NOT SET'}`);
                console.log(`   isDoctor: ${doc.isDoctor}`);
            });
        } else {
            console.log('⚠️  NO APPROVED DOCTORS FOUND!');
            console.log('\nAll doctors:');
            doctors.forEach((doc, i) => {
                console.log(`${i + 1}. ${doc.name} - Status: ${doc.status || 'NOT SET'}`);
            });
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDoctors();
