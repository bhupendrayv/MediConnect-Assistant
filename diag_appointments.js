const mongoose = require('mongoose');
const Appointment = require('./server/models/Appointment');
const User = require('./server/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const appointments = await Appointment.find({});
        console.log(`Total appointments: ${appointments.length}`);

        if (appointments.length > 0) {
            console.log('\nAppointment Detail Sample:');
            const appt = appointments[0];
            console.log(`- ID: ${appt._id}`);
            console.log(`- doctorId: ${appt.doctorId} (type: ${typeof appt.doctorId})`);
            console.log(`- doctorName: ${appt.doctorInfo?.name}`);
            console.log(`- userId: ${appt.userId}`);
            console.log(`- userName: ${appt.userInfo?.name}`);
            console.log(`- status: ${appt.status}`);

            // Find the doctor user
            const doctor = await User.findById(appt.doctorId);
            if (doctor) {
                console.log(`\nDoctor found in User collection: ${doctor.name} (${doctor._id})`);
            } else {
                console.log(`\n⚠️ Doctor with ID ${appt.doctorId} NOT FOUND in User collection`);
                // Try finding by name
                const docByName = await User.findOne({ name: appt.doctorInfo?.name });
                if (docByName) {
                    console.log(`- Found doctor by name instead: ${docByName.name} (${docByName._id})`);
                }
            }
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkData();
