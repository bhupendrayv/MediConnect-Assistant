const express = require('express');
const {
    getUserData,
    applyDoctorController,
    getAllNotificationController,
    bookAppointmentController,
    bookingAvailabilityController,
    userAppointmentsController,
    predictDiseaseController,
    getDiagnosisHistoryController,
    checkAppointmentController,
    getDashboardStatsController,
    cancelAppointmentController,
    rescheduleAppointmentController,
    getPublicDoctorsController,
    updatePublicDoctorController,
    updateUserProfileController,
    createRazorpayOrderController,
    verifyPaymentController
} = require('../controllers/userController');
const {
    createStripeSessionController,
    verifyStripePaymentController
} = require('../controllers/stripeController');
const {
    getSiteSettingsController
} = require('../controllers/adminController');
const {
    requestBloodController,
    getBloodRequestsController
} = require('../controllers/bloodBankController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get User Data || POST & GET
router.post('/getUserData', authMiddleware, getUserData);
router.get('/getUserData', authMiddleware, getUserData);

// Apply Doctor || POST
router.post('/apply-doctor', authMiddleware, applyDoctorController);

// Notification || POST
router.post('/get-all-notification', authMiddleware, getAllNotificationController);

// Book Appointment || POST
router.post('/book-appointment', authMiddleware, bookAppointmentController);

// Booking Availability || POST
router.post('/booking-availability', authMiddleware, bookingAvailabilityController);

// User Appointments List || GET
router.get('/user-appointments', authMiddleware, userAppointmentsController);

// Predict Disease || POST
router.post('/predict-disease', authMiddleware, predictDiseaseController);

// Get Diagnosis History || POST & GET
router.post('/get-diagnosis-history', authMiddleware, getDiagnosisHistoryController);
router.get('/get-diagnosis-history', authMiddleware, getDiagnosisHistoryController);

// Check Appointment || POST
router.post('/check-appointment', authMiddleware, checkAppointmentController);

// Get Dashboard Stats || GET
router.get('/get-dashboard-stats', authMiddleware, getDashboardStatsController);

// Cancel Appointment || POST
router.post('/cancel-appointment', authMiddleware, cancelAppointmentController);

// Reschedule Appointment || POST
router.post('/reschedule-appointment', authMiddleware, rescheduleAppointmentController);

// Blood Bank Routes
router.post('/request-blood', authMiddleware, requestBloodController);
router.get('/get-blood-requests', authMiddleware, getBloodRequestsController);

// Public Doctor Routes (For Landing Page)
router.get('/getAllDoctors', getPublicDoctorsController);
router.post('/updateDoctorPublic', authMiddleware, updatePublicDoctorController);

// Update User Profile (Image, Bio, Name)
router.post('/update-profile-picture', authMiddleware, updateUserProfileController);
router.post('/update-profile', authMiddleware, updateUserProfileController);

// Public Site Settings
router.get('/getPublicSiteSettings', getSiteSettingsController);

// Razorpay Routes
router.post('/create-razorpay-order', authMiddleware, createRazorpayOrderController);
router.post('/verify-payment', authMiddleware, verifyPaymentController);

// Stripe Routes
router.post('/create-stripe-session', authMiddleware, createStripeSessionController);
router.post('/verify-stripe-payment', authMiddleware, verifyStripePaymentController);

module.exports = router;
