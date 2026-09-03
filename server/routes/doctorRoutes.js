const express = require('express');
const {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController,
    transferAppointmentController,
    toggleAvailabilityController
} = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// POST & GET SINGLE DOCTOR INFO
router.post('/getDoctorInfo', authMiddleware, getDoctorInfoController);
router.get('/getDoctorInfo', authMiddleware, getDoctorInfoController);

// POST UPDATE PROFILE
router.post('/updateProfile', authMiddleware, updateProfileController);

// POST GET SINGLE DOCTOR INFO BY ID
router.post('/getDoctorById', authMiddleware, getDoctorByIdController);

// GET APPOINTMENTS
router.get('/doctor-appointments', authMiddleware, doctorAppointmentsController);

// POST UPDATE STATUS
router.post('/update-status', authMiddleware, updateStatusController);

// POST TRANSFER APPOINTMENT
router.post('/transfer-appointment', authMiddleware, transferAppointmentController);

// POST TOGGLE AVAILABILITY
router.post('/toggle-availability', authMiddleware, toggleAvailabilityController);

module.exports = router;
