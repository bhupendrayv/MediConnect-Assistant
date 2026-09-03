const express = require('express');
const {
    getAllUsersController,
    getAllDoctorsController,
    addDoctorController,
    changeAccountStatusController,
    getSiteSettingsController,
    updateSiteSettingsController,
    getAdminOverviewStatsController,
    getAllAppointmentsController,
    broadcastNotificationController
} = require('../controllers/adminController');
const {
    getAllBloodRequestsController,
    updateBloodStatusController
} = require('../controllers/bloodBankController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Overview Stats & Analytics || GET
router.get('/overview-stats', authMiddleware, getAdminOverviewStatsController);

// Get All Users || GET
router.get('/getAllUsers', authMiddleware, getAllUsersController);

// Doctor Management Routes
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);
router.post('/addDoctor', authMiddleware, addDoctorController);
router.post('/changeAccountStatus', authMiddleware, changeAccountStatusController);

// Appointments Global Ledger
router.get('/getAllAppointments', authMiddleware, getAllAppointmentsController);

// Notification Broadcast Route
router.post('/broadcast-notification', authMiddleware, broadcastNotificationController);

// Blood Bank Admin Routes
router.get('/getAllBloodRequests', authMiddleware, getAllBloodRequestsController);
router.post('/updateBloodStatus', authMiddleware, updateBloodStatusController);

// Site Settings Routes
router.get('/getSiteSettings', authMiddleware, getSiteSettingsController);
router.post('/updateSiteSettings', authMiddleware, updateSiteSettingsController);

module.exports = router;

