const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true,
        default: 1
    },
    hospitalName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
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
        required: true
    },
    reason: {
        type: String
    }
}, { timestamps: true });

const bloodRequestModel = mongoose.model('bloodRequests', bloodRequestSchema);

module.exports = bloodRequestModel;
