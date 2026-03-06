const express = require('express');
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController, getSiteSettingsController, updateSiteSettingsController } = require('../controllers/adminController');
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

// Site Settings Routes
router.get('/getSiteSettings', authMiddleware, getSiteSettingsController);
router.post('/updateSiteSettings', authMiddleware, updateSiteSettingsController);


module.exports = router;
