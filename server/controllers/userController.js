const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Diagnosis = require('../models/Diagnosis');

const getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(200).send({
                message: 'User not found',
                success: false
            });
        }
        user.password = undefined; // Hide password
        res.status(200).send({
            success: true,
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Auth Error',
            success: false,
            error
        });
    }
};

const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = await User.findOneAndUpdate(
            { _id: req.body.userId },
            {
                isDoctor: false, // Pending approval
                status: 'pending',
                ...req.body
            },
            { new: true }
        );

        // Notify admin (simplification: find admin and add notification)
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            const notification = adminUser.seenNotifications;
            notification.push({
                type: 'apply-doctor-request',
                message: `${newDoctor.name} Has Applied For A Doctor Account`,
                data: {
                    doctorId: newDoctor._id,
                    name: newDoctor.name,
                    onClickPath: '/admin/doctors'
                }
            });
            await User.findByIdAndUpdate(adminUser._id, { seenNotifications: notification });
        }

        res.status(201).send({
            success: true,
            message: 'Doctor Account Applied Successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error While Applying For Doctor'
        });
    }
};

const getAllNotificationController = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        const seenNotifications = user.seenNotifications;
        const unseenNotifications = user.unseenNotifications;

        // Move all to seen
        seenNotifications.push(...unseenNotifications);
        user.unseenNotifications = [];
        user.seenNotifications = seenNotifications;

        const updatedUser = await user.save();
        res.status(200).send({
            success: true,
            message: 'All notifications marked as read',
            data: updatedUser,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Notification',
            success: false,
            error
        });
    }
}


const bookAppointmentController = async (req, res) => {
    try {
        const { doctorId, userId, doctorInfo, userInfo, date, time, selectedServices } = req.body;

        // Validate required fields
        if (!doctorId || !userId || !date || !time) {
            return res.status(400).send({
                success: false,
                message: 'Missing required fields: doctorId, userId, date, or time'
            });
        }

        if (!doctorInfo || !userInfo) {
            return res.status(400).send({
                success: false,
                message: 'Missing doctor or user information'
            });
        }

        console.log('Booking appointment for:', {
            doctorId,
            userId,
            date,
            time,
            servicesCount: selectedServices?.length || 0
        });

        // Generate unique appointment code (e.g., HH-ABCD)
        const appointmentCode = `HH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Calculate total amount
        const servicesTotal = (selectedServices || []).reduce((acc, curr) => acc + (curr.price || 0), 0);
        const totalAmount = (doctorInfo.feesPerConsultation || 0) + servicesTotal;

        const newAppointment = new Appointment({
            doctorId,
            userId,
            doctorInfo,
            userInfo,
            date,
            time,
            appointmentCode,
            selectedServices: selectedServices || [],
            status: 'pending',
            totalAmount
        });

        await newAppointment.save();
        console.log('Appointment saved successfully:', appointmentCode);

        // Find doctor and add notification
        const doctorUser = await User.findOne({ _id: doctorId });
        if (doctorUser) {
            // Ensure unseenNotifications array exists
            if (!doctorUser.unseenNotifications) {
                doctorUser.unseenNotifications = [];
            }

            doctorUser.unseenNotifications.push({
                type: 'new-appointment-request',
                message: `New appointment request (${appointmentCode}) from ${userInfo.name}`,
                onClickPath: '/doctor-appointments'
            });

            await doctorUser.save();
            console.log('Notification sent to doctor:', doctorUser.name);
        } else {
            console.warn('Doctor not found for notification:', doctorId);
        }

        res.status(200).send({
            success: true,
            message: 'Appointment Booked Successfully',
            data: newAppointment
        });
    } catch (error) {
        console.error('Error in bookAppointmentController:', error);
        console.error('Error stack:', error.stack);
        res.status(500).send({
            success: false,
            error,
            message: error.message || 'Error While Booking Appointment',
        });
    }
};

const checkAppointmentController = async (req, res) => {
    try {
        const { appointmentCode } = req.body;
        const appointment = await Appointment.findOne({ appointmentCode });

        if (!appointment) {
            return res.status(200).send({
                success: false,
                message: 'Invalid Appointment Code'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Appointment Details Found',
            data: appointment
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error In Verifying Appointment',
            error
        });
    }
};

const bookingAvailabilityController = async (req, res) => {
    try {
        const date = req.body.date;
        const doctorId = req.body.doctorId;
        const time = req.body.time;

        const appointments = await Appointment.find({
            doctorId,
            date,
            time,
            status: 'approved'
        });

        if (appointments.length > 0) {
            return res.status(200).send({
                message: 'Appointments not Available at this time',
                success: false,
            });
        } else {
            return res.status(200).send({
                success: true,
                message: 'Appointments available',
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error In Booking Availability',
        });
    }
};

const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.body.userId }).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'Users Appointments Fetch Successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error In User Appointments',
        });
    }
};


const predictDisease = require('../utils/symptomChecker');

const predictDiseaseController = async (req, res) => {
    try {
        const { symptoms, userId } = req.body;
        if (!symptoms) {
            return res.status(400).send({
                success: false,
                message: 'Symptoms are required',
            });
        }
        const prediction = predictDisease(symptoms);

        // Find relevant doctors
        const suggestedDoctors = await User.find({
            isDoctor: true,
            status: 'approved',
            isAvailable: true,
            specialization: { $regex: prediction.specialist, $options: 'i' } // Case-insensitive match
        }).select('name specialization image feesPerConsultation timings isAvailable');

        // Save diagnosis to DB
        const newDiagnosis = new Diagnosis({
            userId,
            symptoms,
            disease: prediction.disease,
            severity: prediction.severity,
            specialist: prediction.specialist,
            // Assuming we might want to save the recommended doctor in history later, but for now just returning it
        });
        await newDiagnosis.save();

        res.status(200).send({
            success: true,
            message: 'Diagnosis Prediction Success',
            data: { ...prediction, suggestedDoctors },
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Prediction',
            error
        });
    }
};

const getDiagnosisHistoryController = async (req, res) => {
    try {
        const diagnoses = await Diagnosis.find({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: 'Diagnosis History Fetched Successfully',
            data: diagnoses
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching Diagnosis History',
            error
        });
    }
};

const getDashboardStatsController = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        const upcomingAppointmentsCount = await Appointment.countDocuments({ userId, status: 'pending' });
        const approvedAppointmentsCount = await Appointment.countDocuments({ userId, status: 'approved' });
        const rejectedAppointmentsCount = await Appointment.countDocuments({ userId, status: 'rejected' });
        const aiDiagnosisCount = await Diagnosis.countDocuments({ userId });

        // Earnings/Revenue calculation (Removed)
        let totalRevenue = 0;
        let totalEarnings = 0;

        res.status(200).send({
            success: true,
            message: 'Dashboard Stats Fetched Successfully',
            data: {
                upcomingAppointmentsCount: upcomingAppointmentsCount + approvedAppointmentsCount,
                pastVisitsCount: approvedAppointmentsCount,
                aiDiagnosisCount: aiDiagnosisCount,
                totalRevenue: totalRevenue,
                totalEarnings: totalEarnings
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching Dashboard Stats',
            error
        });
    }
};

const cancelAppointmentController = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'cancelled' });
        res.status(200).send({
            success: true,
            message: 'Appointment Cancelled Successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error In Cancel Appointment',
            error
        });
    }
};

const rescheduleAppointmentController = async (req, res) => {
    try {
        const { appointmentId, date, time } = req.body;
        // Optional: Check availability for the new slot before updating
        await Appointment.findByIdAndUpdate(appointmentId, { date, time, status: 'pending' }); // Reset to pending if rescheduled? Or keep same if auto-approved. Let's reset to pending likely.
        res.status(200).send({
            success: true,
            message: 'Appointment Rescheduled Successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error In Reschedule Appointment',
            error
        });
    }
};



const getPublicDoctorsController = async (req, res) => {
    try {
        // Filter doctors by approved status AND availability
        const doctors = await User.find({
            isDoctor: true,
            status: 'approved'
        });
        res.status(200).send({
            success: true,
            message: 'Doctors Fetched Successfully',
            data: doctors
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching doctors',
            error
        });
    }
};

const updatePublicDoctorController = async (req, res) => {
    try {
        // expect doctorId in body, or id
        const { _id, ...updateData } = req.body;
        const doctor = await User.findByIdAndUpdate(_id, updateData, { new: true });
        res.status(200).send({
            success: true,
            message: 'Doctor Updated Successfully',
            data: doctor
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error updating doctor',
            error
        });
    }
};

const updateUserProfileController = async (req, res) => {
    try {
        const { userId, image } = req.body;
        const user = await User.findByIdAndUpdate(userId, { image }, { new: true });
        user.password = undefined;
        res.status(200).send({
            success: true,
            message: 'Profile Updated Successfully',
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error Updating Profile',
            error
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
    updateUserProfileController
};


