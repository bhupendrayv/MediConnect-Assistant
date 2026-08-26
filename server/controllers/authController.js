const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
    try {
        const { name, email, password, role, phone, specialization, experience, feesPerConsultation } = req.body;

        // 1. Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).send({ success: false, message: 'Full name is required.' });
        }
        if (!email || !email.trim()) {
            return res.status(400).send({ success: false, message: 'Email address is required.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).send({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(200).send({ success: false, message: 'An account with this email already exists. Please log in.' });
        }

        const userRole = role === 'admin' ? 'admin' : (role === 'doctor' ? 'doctor' : 'patient');
        const isDoc = userRole === 'doctor';
        const isAdm = userRole === 'admin';

        // 4. Create user
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: userRole,
            isAdmin: isAdm,
            isDoctor: isDoc,
            status: isDoc ? 'pending' : 'approved',
            phone: phone ? phone.trim() : '',
            specialization: specialization || undefined,
            experience: experience || undefined,
            feesPerConsultation: feesPerConsultation ? Number(feesPerConsultation) : undefined,
        });

        await newUser.save();

        res.status(201).send({
            success: true,
            message: 'Account created successfully! Please log in.',
        });

    } catch (error) {
        console.error('Register Controller Error:', error);

        // Mongoose duplicate key
        if (error.code === 11000) {
            return res.status(200).send({ success: false, message: 'An account with this email already exists.' });
        }
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const msgs = Object.values(error.errors).map(e => e.message);
            return res.status(400).send({ success: false, message: msgs.join('. ') });
        }

        res.status(500).send({
            success: false,
            message: 'A server error occurred during registration. Please try again.',
        });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).send({ success: false, message: 'Email is required.' });
        }
        if (!password) {
            return res.status(400).send({ success: false, message: 'Password is required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(200).send({ success: false, message: 'No account found with this email. Please register first.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(200).send({ success: false, message: 'Incorrect password. Please try again.' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
            return res.status(500).send({ success: false, message: 'Server configuration error. Please contact support.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, isAdmin: user.isAdmin, isDoctor: user.isDoctor },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin' || !!user.isAdmin,
            isDoctor: user.role === 'doctor' || !!user.isDoctor,
            status: user.status,
            image: user.image || '',
            phone: user.phone || '',
            bio: user.bio || '',
            address: user.address || ''
        };

        res.status(200).send({
            success: true,
            message: 'Login successful!',
            token,
            role: user.role,
            user: safeUser
        });

    } catch (error) {
        console.error('Login Controller Error:', error);
        res.status(500).send({
            success: false,
            message: 'A server error occurred during login. Please try again in a moment.',
        });
    }
};

module.exports = {
    loginController,
    registerController
};
