const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorInfo: {
        name: { type: String, required: true },
        specialization: { type: String, required: true },
        feesPerConsultation: { type: Number, required: true },
    },
    userInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        age: { type: Number },
        gender: { type: String },
        address: { type: String },
        problem: { type: String },
    },
    appointmentCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending',
    },
    symptoms: {
        type: String,
        default: ''
    },
    selectedServices: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_payment_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    },
    stripeSessionId: {
        type: String,
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    doctorNotes: {
        type: String,
        default: ''
    },
    prescription: {
        type: String,
        default: ''
    },
    recommendations: {
        type: String,
        default: ''
    },
    prescribedAt: {
        type: Date
    },
    transferHistory: [{
        fromDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fromDoctorName: { type: String },
        toDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        toDoctorName: { type: String },
        reason: { type: String, default: '' },
        transferredAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
