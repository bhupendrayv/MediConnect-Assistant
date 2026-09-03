const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Diagnosis = require('../models/Diagnosis');
const predictDisease = require('../utils/symptomChecker');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Get current user profile data
const getUserData = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        if (!userId) {
            return res.status(400).send({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).send({
                message: 'User not found',
                success: false
            });
        }

        const userData = user.toObject();
        userData.isAdmin = userData.role === 'admin' || !!userData.isAdmin;
        userData.isDoctor = userData.role === 'doctor' || !!userData.isDoctor;

        res.status(200).send({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error in getUserData:', error);
        res.status(500).send({
            message: 'Authentication or Server Error',
            success: false,
            error: error.message
        });
    }
};

// Apply for Doctor status
const applyDoctorController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { specialization, experience, feesPerConsultation, timings, services, phone, address, bio } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                isDoctor: false, // Pending admin approval
                status: 'pending',
                specialization,
                experience,
                feesPerConsultation: Number(feesPerConsultation) || 500,
                timings: timings || { start: "09:00", end: "17:00" },
                services: Array.isArray(services) ? services : [],
                phone: phone || '',
                address: address || '',
                bio: bio || ''
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // Notify admin
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            if (!adminUser.unseenNotifications) {
                adminUser.unseenNotifications = [];
            }
            adminUser.unseenNotifications.push({
                type: 'apply-doctor-request',
                message: `${updatedUser.name} has applied for a Doctor account`,
                data: {
                    doctorId: updatedUser._id,
                    name: updatedUser.name,
                    onClickPath: '/admin/doctors'
                },
                createdAt: new Date()
            });
            await adminUser.save();
        }

        res.status(201).send({
            success: true,
            message: 'Doctor account application submitted successfully. Awaiting admin approval.'
        });

    } catch (error) {
        console.error('Error in applyDoctorController:', error);
        res.status(500).send({
            success: false,
            message: 'Error while applying for doctor account',
            error: error.message
        });
    }
};

// Mark all notifications as seen
const getAllNotificationController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        const seenNotifications = user.seenNotifications || [];
        const unseenNotifications = user.unseenNotifications || [];

        // Move all unseen to seen
        seenNotifications.push(...unseenNotifications);
        user.unseenNotifications = [];
        user.seenNotifications = seenNotifications;

        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).send({
            success: true,
            message: 'All notifications marked as read',
            data: updatedUser,
        });

    } catch (error) {
        console.error('Error in getAllNotificationController:', error);
        res.status(500).send({
            message: 'Error in notifications',
            success: false,
            error: error.message
        });
    }
};

// Book an appointment
const bookAppointmentController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { doctorId, doctorInfo, userInfo, date, time, selectedServices, symptoms } = req.body;

        if (!doctorId || !userId || !date || !time) {
            return res.status(400).send({
                success: false,
                message: 'Doctor, date, and time are required to book an appointment'
            });
        }

        if (!doctorInfo || !userInfo) {
            return res.status(400).send({
                success: false,
                message: 'Doctor and patient details are required'
            });
        }

        // Generate unique appointment code (e.g., HH-A1B2)
        const appointmentCode = `HH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Generate unique transaction ID (e.g., T1234567890)
        const randomDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
        const transactionId = `T${randomDigits}`;

        // Calculate total amount
        const servicesTotal = (selectedServices || []).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
        const baseFee = Number(doctorInfo.feesPerConsultation) || 0;
        const totalAmount = baseFee + servicesTotal;

        const newAppointment = new Appointment({
            doctorId,
            userId,
            doctorInfo,
            userInfo,
            date,
            time,
            appointmentCode,
            transactionId,
            selectedServices: selectedServices || [],
            symptoms: symptoms || '',
            status: 'pending',
            paymentStatus: 'pending',
            totalAmount
        });

        await newAppointment.save();

        // Notify doctor
        const doctorUser = await User.findById(doctorId);
        if (doctorUser) {
            if (!doctorUser.unseenNotifications) {
                doctorUser.unseenNotifications = [];
            }
            doctorUser.unseenNotifications.push({
                type: 'new-appointment-request',
                message: `New appointment request (${appointmentCode}) from ${userInfo.name}`,
                data: {
                    appointmentId: newAppointment._id,
                    appointmentCode
                },
                onClickPath: '/doctor-appointments',
                createdAt: new Date()
            });
            await doctorUser.save();
        }

        res.status(200).send({
            success: true,
            message: 'Appointment booked successfully',
            data: newAppointment
        });
    } catch (error) {
        console.error('Error in bookAppointmentController:', error);
        res.status(500).send({
            success: false,
            message: error.message || 'Error while booking appointment',
            error: error.message
        });
    }
};

// Check appointment by appointmentCode
const checkAppointmentController = async (req, res) => {
    try {
        const { appointmentCode } = req.body;
        if (!appointmentCode) {
            return res.status(400).send({
                success: false,
                message: 'Appointment code is required'
            });
        }

        const cleanCode = appointmentCode.trim().toUpperCase();
        const appointment = await Appointment.findOne({ appointmentCode: cleanCode });

        if (!appointment) {
            return res.status(200).send({
                success: false,
                message: 'Invalid appointment code. No appointment found.'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Appointment details verified successfully',
            data: appointment
        });

    } catch (error) {
        console.error('Error in checkAppointmentController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in verifying appointment',
            error: error.message
        });
    }
};

// Check booking availability for date and time slot
const bookingAvailabilityController = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        if (!doctorId || !date || !time) {
            return res.status(400).send({
                success: false,
                message: 'doctorId, date, and time are required'
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time,
            status: { $in: ['approved', 'pending'] }
        });

        if (existingAppointment) {
            return res.status(200).send({
                message: 'Appointment slot is not available at this time',
                success: false,
            });
        } else {
            return res.status(200).send({
                success: true,
                message: 'Appointment slot is available',
            });
        }

    } catch (error) {
        console.error('Error in bookingAvailabilityController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in checking booking availability',
        });
    }
};

// Get all appointments for a user
const userAppointmentsController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const appointments = await Appointment.find({ userId }).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'User appointments fetched successfully',
            data: appointments,
        });
    } catch (error) {
        console.error('Error in userAppointmentsController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in fetching user appointments',
        });
    }
};

// AI Symptom Checker & Disease Prediction
const predictDiseaseController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { symptoms } = req.body;

        if (!symptoms || !symptoms.trim()) {
            return res.status(400).send({
                success: false,
                message: 'Symptoms description is required',
            });
        }

        const prediction = predictDisease(symptoms);

        // Find matching available approved doctors
        const suggestedDoctors = await User.find({
            isDoctor: true,
            status: 'approved',
            specialization: { $regex: prediction.specialist, $options: 'i' }
        }).select('name specialization image feesPerConsultation timings isAvailable services address phone bio');

        // Save diagnosis history if userId is provided
        if (userId) {
            const newDiagnosis = new Diagnosis({
                userId,
                symptoms: symptoms.trim(),
                disease: prediction.disease,
                severity: prediction.severity,
                specialist: prediction.specialist,
                solution: prediction.solution || ''
            });
            await newDiagnosis.save();
        }

        res.status(200).send({
            success: true,
            message: 'Diagnosis prediction completed successfully',
            data: { ...prediction, suggestedDoctors },
        });

    } catch (error) {
        console.error('Error in predictDiseaseController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in disease prediction',
            error: error.message
        });
    }
};

// Get diagnosis history for a user
const getDiagnosisHistoryController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const diagnoses = await Diagnosis.find({ userId }).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'Diagnosis history fetched successfully',
            data: diagnoses
        });
    } catch (error) {
        console.error('Error in getDiagnosisHistoryController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in fetching diagnosis history',
            error: error.message
        });
    }
};

// Get user dashboard analytics / stats
const getDashboardStatsController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        const pendingAppointmentsCount = await Appointment.countDocuments({ userId, status: 'pending' });
        const approvedAppointmentsCount = await Appointment.countDocuments({ userId, status: 'approved' });
        const completedAppointmentsCount = await Appointment.countDocuments({ userId, status: 'completed' });
        const cancelledAppointmentsCount = await Appointment.countDocuments({ userId, status: 'cancelled' });
        const aiDiagnosisCount = await Diagnosis.countDocuments({ userId });

        res.status(200).send({
            success: true,
            message: 'Dashboard stats fetched successfully',
            data: {
                upcomingAppointmentsCount: pendingAppointmentsCount + approvedAppointmentsCount,
                pastVisitsCount: completedAppointmentsCount + approvedAppointmentsCount,
                cancelledAppointmentsCount,
                aiDiagnosisCount,
                totalRevenue: 0,
                totalEarnings: 0
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStatsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in fetching dashboard statistics',
            error: error.message
        });
    }
};

// Cancel an appointment
const cancelAppointmentController = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).send({ success: false, message: 'appointmentId is required' });
        }

        const updated = await Appointment.findByIdAndUpdate(appointmentId, { status: 'cancelled' }, { new: true });
        if (!updated) {
            return res.status(404).send({ success: false, message: 'Appointment not found' });
        }

        res.status(200).send({
            success: true,
            message: 'Appointment cancelled successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error in cancelAppointmentController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in cancelling appointment',
            error: error.message
        });
    }
};

// Reschedule an appointment
const rescheduleAppointmentController = async (req, res) => {
    try {
        const { appointmentId, date, time } = req.body;
        if (!appointmentId || !date || !time) {
            return res.status(400).send({
                success: false,
                message: 'appointmentId, date, and time are required'
            });
        }

        const updated = await Appointment.findByIdAndUpdate(
            appointmentId,
            { date, time, status: 'pending' },
            { new: true }
        );

        if (!updated) {
            return res.status(404).send({ success: false, message: 'Appointment not found' });
        }

        res.status(200).send({
            success: true,
            message: 'Appointment rescheduled successfully. Awaiting doctor confirmation.',
            data: updated
        });
    } catch (error) {
        console.error('Error in rescheduleAppointmentController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in rescheduling appointment',
            error: error.message
        });
    }
};

// Get list of public approved doctors
const getPublicDoctorsController = async (req, res) => {
    try {
        const doctors = await User.find({
            $or: [
                { status: 'approved' },
                { status: { $exists: false }, isDoctor: true }
            ],
            $and: [{ $or: [{ role: 'doctor' }, { isDoctor: true }] }]
        }).select('-password');

        res.status(200).send({
            success: true,
            message: 'Doctors fetched successfully',
            data: doctors
        });
    } catch (error) {
        console.error('Error in getPublicDoctorsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error fetching doctors list',
            error: error.message
        });
    }
};

// Update doctor information publicly or by admin
const updatePublicDoctorController = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        delete updateData.password;

        const doctor = await User.findByIdAndUpdate(_id, updateData, { new: true }).select('-password');
        res.status(200).send({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error in updatePublicDoctorController:', error);
        res.status(500).send({
            success: false,
            message: 'Error updating doctor profile',
            error: error.message
        });
    }
};

// Update user profile picture and bio
const updateUserProfileController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { image, name, phone, bio, address } = req.body;

        const updateFields = {};
        if (image !== undefined) updateFields.image = image;
        if (name) updateFields.name = name.trim();
        if (phone !== undefined) updateFields.phone = phone;
        if (bio !== undefined) updateFields.bio = bio;
        if (address !== undefined) updateFields.address = address;

        const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        const userData = user.toObject();
        userData.isAdmin = userData.role === 'admin' || !!userData.isAdmin;
        userData.isDoctor = userData.role === 'doctor' || !!userData.isDoctor;

        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            data: userData
        });
    } catch (error) {
        console.error('Error in updateUserProfileController:', error);
        res.status(500).send({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Razorpay Controllers
const createRazorpayOrderController = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
            return res.status(200).send({
                success: false,
                isMock: true,
                message: 'Razorpay keys are in demo/test mode. You can test card payments via Stripe or mock verification.'
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: `rcpt_${appointmentId || Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, { razorpay_order_id: order.id });
        }

        res.status(200).send({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send({
            success: false,
            message: 'Error in creating Razorpay order',
            error: error.message
        });
    }
};

const verifyPaymentController = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentId
        } = req.body;

        if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'YOUR_KEY_SECRET') {
            // Mock confirmation for testing if secret key is default placeholder
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, {
                    razorpay_payment_id: razorpay_payment_id || 'mock_pay_id',
                    paymentStatus: 'paid',
                    status: 'approved'
                });
            }
            return res.status(200).send({
                success: true,
                message: "Payment verified successfully (Demo Mode)"
            });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                razorpay_payment_id,
                razorpay_signature,
                paymentStatus: 'paid',
                status: 'approved'
            });

            return res.status(200).send({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Invalid signature sent!"
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).send({
            success: false,
            message: "Internal server error during payment verification",
            error: error.message
        });
    }
};

module.exports = {
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
};
