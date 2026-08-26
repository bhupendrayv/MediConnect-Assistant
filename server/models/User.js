const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
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
    isAdmin: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        default: '',
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


// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt and normalize email and roles
userSchema.pre('save', async function (next) {
    if (this.isModified('email') && this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    if (this.role === 'admin') {
        this.isAdmin = true;
    }
    if (this.role === 'doctor') {
        this.isDoctor = true;
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
