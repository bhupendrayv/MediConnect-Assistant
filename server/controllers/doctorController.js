const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get profile info of current logged-in doctor
const getDoctorInfoController = async (req, res) => {
    try {
        const doctorId = req.user?.id || req.body.userId;
        const doctor = await User.findById(doctorId).select('-password');

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor account not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Doctor data fetched successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Error in getDoctorInfoController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in fetching doctor details',
        });
    }
};

// Update doctor profile (services, timings, fees, etc.)
const updateProfileController = async (req, res) => {
    try {
        const doctorId = req.user?.id || req.body.userId;
        const updateData = { ...req.body };
        delete updateData.password;
        delete updateData.role;
        delete updateData.isAdmin;

        const doctor = await User.findByIdAndUpdate(
            doctorId,
            updateData,
            { new: true }
        ).select('-password');

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Doctor profile updated successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Error in updateProfileController:', error);
        res.status(500).send({
            success: false,
            message: 'Error updating doctor profile',
            error: error.message,
        });
    }
};

// Get single doctor details by Doctor ID
const getDoctorByIdController = async (req, res) => {
    try {
        const doctorId = req.body.doctorId || req.user?.id;
        if (!doctorId) {
            return res.status(400).send({
                success: false,
                message: 'doctorId is required'
            });
        }

        const doctor = await User.findById(doctorId).select('-password');
        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Doctor info fetched successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Error in getDoctorByIdController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in fetching doctor info',
        });
    }
};

// Get list of appointments for a doctor
const doctorAppointmentsController = async (req, res) => {
    try {
        const doctorId = req.user?.id || req.body.userId;
        const doctor = await User.findById(doctorId);

        const orConditions = [{ doctorId: doctorId }];
        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            orConditions.push({ doctorId: new mongoose.Types.ObjectId(doctorId) });
        }
        if (doctor?.name) {
            orConditions.push({ 'doctorInfo.name': doctor.name });
        }

        const appointments = await Appointment.find({ $or: orConditions }).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'Doctor appointments fetched successfully',
            data: appointments,
        });
    } catch (error) {
        console.error('Error in doctorAppointmentsController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in fetching doctor appointments',
        });
    }
};

// Update appointment status (approved, rejected, completed, cancelled)
const updateStatusController = async (req, res) => {
    try {
        const { appointmentsId, status } = req.body;
        if (!appointmentsId || !status) {
            return res.status(400).send({
                success: false,
                message: 'appointmentsId and status are required'
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentsId,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Send notification to patient
        if (appointment.userId) {
            const user = await User.findById(appointment.userId);
            if (user) {
                if (!user.unseenNotifications) user.unseenNotifications = [];
                user.unseenNotifications.push({
                    type: 'appointment-status-updated',
                    message: `Your appointment with Dr. ${appointment.doctorInfo?.name || 'Specialist'} has been ${status}`,
                    data: {
                        appointmentId: appointment._id,
                        appointmentCode: appointment.appointmentCode,
                        status
                    },
                    onClickPath: '/appointments',
                    createdAt: new Date()
                });
                await user.save();
            }
        }

        res.status(200).send({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });
    } catch (error) {
        console.error('Error in updateStatusController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error updating appointment status',
        });
    }
};

// Toggle doctor availability (online / offline)
const toggleAvailabilityController = async (req, res) => {
    try {
        const doctorId = req.user?.id || req.body.userId;
        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor not found',
            });
        }

        doctor.isAvailable = !doctor.isAvailable;
        await doctor.save();

        res.status(200).send({
            success: true,
            message: `Status updated: You are now ${doctor.isAvailable ? 'Available' : 'Unavailable'}`,
            data: { isAvailable: doctor.isAvailable },
        });
    } catch (error) {
        console.error('Error in toggleAvailabilityController:', error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error toggling availability',
        });
    }
};

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController,
    toggleAvailabilityController,
};
