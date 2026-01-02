const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
    try {
        const { name, email, password, role, specialization, experience, feesPerConsultation, timings } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).send({ message: 'User already exists', success: false });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            specialization,
            experience,
            feesPerConsultation,
            timings
        });

        if (role === 'doctor') {
            newUser.isDoctor = true;
        }

        await newUser.save();
        res.status(201).send({ message: 'Register Successfully', success: true });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Register Controller ${error.message}` });
    }
};

const loginController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).send({ message: 'User not found', success: false });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).send({ message: 'Invalid Email or Password', success: false });
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
