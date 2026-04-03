const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
    try {
        console.log('Registration Attempt:', req.body.email, 'Role:', req.body.role);
        const { name, email, password, role, specialization, experience, feesPerConsultation, timings } = req.body;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(200).send({ message: 'User already exists', success: false });
        }

        const newUser = new User({
            name,
            email: normalizedEmail,
            password,
            role,
            specialization,
            experience,
            feesPerConsultation,
            timings
        });
        console.log('New User Object Created');

        if (role === 'doctor') {
            newUser.isDoctor = true;
        }

        try {
            await newUser.save();
            console.log('User saved successfully');
            res.status(201).send({ message: 'Register Successfully', success: true });
        } catch (saveError) {
            console.error('Mongoose Save Error:', saveError);
            if (saveError.name === 'ValidationError') {
                const messages = Object.values(saveError.errors).map(err => err.message);
                return res.status(200).send({ message: `Validation Error: ${messages.join(', ')}`, success: false });
            }
            throw saveError; // Re-throw to be caught by outer catch
        }

    } catch (error) {
        console.error('Register Controller Error:', error);
        res.status(500).send({ 
            success: false, 
            message: `Registration Error: ${error.message || 'Internal Server Error'}`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

const loginController = async (req, res) => {
    try {
        console.log('Login Attempt:', req.body.email);
        const normalizedEmail = req.body.email?.toLowerCase();
        if (!normalizedEmail) {
            return res.status(200).send({ message: 'Email is required', success: false });
        }
        const user = await User.findOne({ email: normalizedEmail });
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
            return res.status(200).send({ message: 'User not found (check email)', success: false });
        }
        const isMatch = await user.matchPassword(req.body.password);
        console.log('Password Match:', isMatch ? 'Yes' : 'No');
        if (!isMatch) {
            return res.status(200).send({ message: 'Invalid Password', success: false });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ message: 'Login Success', success: true, token, role: user.role });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
    }
};

const authController = {
    loginController,
    registerController
};

module.exports = authController;
