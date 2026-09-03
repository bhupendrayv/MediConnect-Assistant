const express = require('express');
const { loginController, registerController, doctorForgotPasswordController } = require('../controllers/authController');

const router = express.Router();

// REGISTER || POST
router.post('/register', registerController);

// LOGIN || POST
router.post('/login', loginController);

// DOCTOR FORGOT PASSWORD || POST
router.post('/doctor-forgot-password', doctorForgotPasswordController);

module.exports = router;
