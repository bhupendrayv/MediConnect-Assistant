const mongoose = require('mongoose');
require('dotenv').config();
const Appointment = require('./models/Appointment');

const updateAppointments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const appointments = await Appointment.find({
            $or: [
                { transactionId: { $exists: false } },
                { transactionId: null },
                { transactionId: '' }
            ]
        });

        console.log(`Found ${appointments.length} appointments needing transaction IDs`);

        // Use bulkWrite for safer and faster updates without triggering full schema validation for missing old fields
        const bulkOps = appointments.map(appt => ({
            updateOne: {
                filter: { _id: appt._id },
                update: { $set: { transactionId: `T${Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')}` } }
            }
        }));

        if (bulkOps.length > 0) {
            await Appointment.bulkWrite(bulkOps);
        }

        console.log('Successfully updated all appointments');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateAppointments();
