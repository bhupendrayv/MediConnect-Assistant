const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient',
    },
    address: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    // Doctor specific fields
    specialization: {
        type: String,
    },
    experience: {
        type: String,
    },
    feesPerConsultation: {
        type: Number,
    },
    // Using simple array for now, can be complex logic later
    timings: {
        type: Object, // e.g., { start: "09:00", end: "17:00" }
    },
    services: {
        type: Array,
        default: []
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isDoctor: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    seenNotifications: {
        type: Array,
        default: [],
    },
    unseenNotifications: {
        type: Array,
        default: [],
    },
}, { timestamps: true });

// Disable buffering to catch connection errors immediately
userSchema.set('bufferCommands', false);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt and normalize email
userSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
