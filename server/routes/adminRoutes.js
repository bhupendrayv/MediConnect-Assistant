const express = require('express');
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController } = require('../controllers/adminController');
const { getAllBloodRequestsController, updateBloodStatusController } = require('../controllers/bloodBankController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get All Users || GET
router.get('/getAllUsers', authMiddleware, getAllUsersController);

// Get All Doctors || GET
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// Account Status || POST
router.post('/changeAccountStatus', authMiddleware, changeAccountStatusController);

// Blood Bank Admin Routes
router.get('/getAllBloodRequests', authMiddleware, getAllBloodRequestsController);
router.post('/updateBloodStatus', authMiddleware, updateBloodStatusController);

module.exports = router;
