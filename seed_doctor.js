const mongoose = require('mongoose');
const User = require('./server/models/User'); // Adjust path
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const seedDoctor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing doctors for fresh seed
        await User.deleteMany({ isDoctor: true });
        console.log('Cleared existing doctors');

        // Create diverse doctor profiles
        const doctors = [
            {
                name: 'Dr. Sarah Mitchell',
                email: 'sarah.mitchell@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'female',
                specialization: 'Cardiology',
                experience: '15+ Years in Cardiovascular Medicine',
                address: 'Heart Care Center, 456 Medical Plaza, New York, NY 10001',
                bio: 'Board-certified cardiologist specializing in preventive cardiology and heart disease management. Committed to providing compassionate, evidence-based care to help patients achieve optimal heart health.',
                feesPerConsultation: 150
            },
            {
                name: 'Dr. James Anderson',
                email: 'james.anderson@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'male',
                specialization: 'Neurology',
                experience: '20+ Years in Neurological Care',
                address: 'Brain & Spine Institute, 789 Healthcare Blvd, Boston, MA 02101',
                bio: 'Expert neurologist with extensive experience in treating complex neurological disorders. Specializes in headache management, epilepsy, and neurodegenerative diseases with a patient-centered approach.',
                feesPerConsultation: 175
            },
            {
                name: 'Dr. Emily Chen',
                email: 'emily.chen@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'female',
                specialization: 'Pediatrics',
                experience: '12+ Years in Child Healthcare',
                address: 'Children\'s Wellness Center, 321 Kids Avenue, San Francisco, CA 94102',
                bio: 'Dedicated pediatrician passionate about children\'s health and development. Provides comprehensive care from newborns to adolescents with a focus on preventive medicine and family education.',
                feesPerConsultation: 120
            },
            {
                name: 'Dr. Michael Roberts',
                email: 'michael.roberts@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'male',
                specialization: 'Orthopedic Surgery',
                experience: '18+ Years in Orthopedics',
                address: 'Sports Medicine & Orthopedic Center, 555 Athletic Drive, Los Angeles, CA 90001',
                bio: 'Renowned orthopedic surgeon specializing in sports injuries, joint replacement, and minimally invasive procedures. Dedicated to helping patients regain mobility and return to active lifestyles.',
                feesPerConsultation: 200
            },
            {
                name: 'Dr. Priya Sharma',
                email: 'priya.sharma@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'female',
                specialization: 'Dermatology',
                experience: '10+ Years in Skin Care',
                address: 'Advanced Dermatology Clinic, 888 Beauty Lane, Miami, FL 33101',
                bio: 'Expert dermatologist offering comprehensive skin care solutions including medical, surgical, and cosmetic dermatology. Committed to helping patients achieve healthy, radiant skin.',
                feesPerConsultation: 130
            },
            {
                name: 'Dr. David Thompson',
                email: 'david.thompson@smarthealthcare.com',
                password: 'password123',
                isDoctor: true,
                status: 'approved',
                gender: 'male',
                specialization: 'General Medicine',
                experience: '25+ Years in Family Practice',
                address: 'Community Health Center, 123 Main Street, Chicago, IL 60601',
                bio: 'Experienced family physician providing comprehensive primary care for patients of all ages. Focuses on preventive medicine, chronic disease management, and building long-term patient relationships.',
                feesPerConsultation: 100
            }
        ];

        // Insert all doctors
        await User.insertMany(doctors);
        console.log(`Successfully created ${doctors.length} diverse doctor profiles`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding doctors:', error);
        process.exit(1);
    }
};

seedDoctor();
