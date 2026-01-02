const express = require('express');
const { getUserData, applyDoctorController, getAllNotificationController, bookAppointmentController, bookingAvailabilityController, userAppointmentsController, predictDiseaseController, getDiagnosisHistoryController, checkAppointmentController, getDashboardStatsController, cancelAppointmentController, rescheduleAppointmentController, getPublicDoctorsController, updatePublicDoctorController, updateUserProfileController } = require('../controllers/userController');
const { getSiteSettingsController } = require('../controllers/adminController');
const { requestBloodController, getBloodRequestsController } = require('../controllers/bloodBankController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get User Data || POST
router.post('/getUserData', authMiddleware, getUserData);

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

// Get Diagnosis History || POST
router.post('/get-diagnosis-history', authMiddleware, getDiagnosisHistoryController);

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
router.post('/updateDoctorPublic', updatePublicDoctorController);

// Update User Profile (Image)
router.post('/update-profile-picture', authMiddleware, updateUserProfileController);

// Public Site Settings
router.get('/getPublicSiteSettings', getSiteSettingsController);

module.exports = router;

