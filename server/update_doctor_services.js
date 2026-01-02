const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const servicesData = [
    {
        id: 'consult-video',
        name: 'Video Consultation',
        description: 'Connect with a doctor virtually via high-definition video call.',
        price: 20,
        duration: '30 mins',
        icon: 'FiVideo'
    },
    {
        id: 'consult-person',
        name: 'In-Person Visit',
        description: 'Visit the clinic for a traditional face-to-face examination.',
        price: 30,
        duration: '30 mins',
        icon: 'FiUser'
    },
    {
        id: 'svc-general',
        name: 'General Checkup',
        description: 'Comprehensive health assessment including vitals and physical exam.',
        price: 50,
        duration: '45 mins',
        icon: 'FiActivity'
    },
    {
        id: 'svc-followup',
        name: 'Follow-up',
        description: 'Review progress and adjust treatment plans if necessary.',
        price: 25,
        duration: '20 mins',
        icon: 'FiRefreshCw'
    },
    {
        id: 'svc-lab',
        name: 'Lab Tests',
        description: 'Sample collection for blood, urine, or other pathology tests.',
        price: 15,
        duration: '15 mins',
        icon: 'FiDroplet'
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

const updateDoctor = async () => {
    await connectDB();
    try {
        const doctorId = '6947b238f7448c96636091ed';
        const doctor = await User.findById(doctorId);
        if (doctor) {
            doctor.services = servicesData;
            await doctor.save();
            console.log('Doctor Services Updated Successfully!');
            console.log(JSON.stringify(doctor.services, null, 2));
        } else {
            console.log('Doctor not found!');
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

updateDoctor();
