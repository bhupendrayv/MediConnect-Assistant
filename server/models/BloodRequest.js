const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    patientName: {
        type: String,
        required: true,
        trim: true,
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    hospitalName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    neededBy: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
    },
    reason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = BloodRequest;
