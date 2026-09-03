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
        const { appointmentsId, status, doctorNotes, prescription, recommendations } = req.body;
        if (!appointmentsId || !status) {
            return res.status(400).send({
                success: false,
                message: 'appointmentsId and status are required'
            });
        }

        const updateData = { status };
        if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes;
        if (prescription !== undefined) updateData.prescription = prescription;
        if (recommendations !== undefined) updateData.recommendations = recommendations;
        if (status === 'completed' || doctorNotes || prescription || recommendations) {
            updateData.prescribedAt = new Date();
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentsId,
            updateData,
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
                const statusLabel = status === 'completed' ? 'Checkup Completed' : status;
                user.unseenNotifications.push({
                    type: 'appointment-status-updated',
                    message: `Your appointment with Dr. ${appointment.doctorInfo?.name || 'Specialist'} status updated to: ${statusLabel}`,
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
            message: `Appointment status updated to ${status === 'completed' ? 'Checkup Completed' : status}`,
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

// Transfer appointment to another doctor
const transferAppointmentController = async (req, res) => {
    try {
        const { appointmentId, targetDoctorId, reason } = req.body;
        const currentDoctorUserId = req.user?.id;

        if (!appointmentId || !targetDoctorId) {
            return res.status(400).send({
                success: false,
                message: 'Appointment ID and Target Doctor ID are required'
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: 'Appointment not found'
            });
        }

        const targetDoctor = await User.findById(targetDoctorId);
        if (!targetDoctor) {
            return res.status(404).send({
                success: false,
                message: 'Target doctor not found'
            });
        }

        const fromDoctorName = appointment.doctorInfo?.name || 'Previous Doctor';
        const fromDoctorId = appointment.doctorId;

        // Push transfer log
        if (!appointment.transferHistory) appointment.transferHistory = [];
        appointment.transferHistory.push({
            fromDoctorId,
            fromDoctorName: fromDoctorName.toLowerCase().startsWith('dr') ? fromDoctorName : `Dr. ${fromDoctorName}`,
            toDoctorId: targetDoctor._id,
            toDoctorName: targetDoctor.name?.toLowerCase().startsWith('dr') ? targetDoctor.name : `Dr. ${targetDoctor.name}`,
            reason: reason || 'Patient referred for specialized consultation',
            transferredAt: new Date()
        });

        // Re-assign doctor
        appointment.doctorId = targetDoctor._id;
        appointment.doctorInfo = {
            name: targetDoctor.name,
            specialization: targetDoctor.specialization || 'Specialist',
            feesPerConsultation: targetDoctor.feesPerConsultation || appointment.doctorInfo?.feesPerConsultation || 500
        };

        await appointment.save();

        // Notify new doctor
        if (!targetDoctor.unseenNotifications) targetDoctor.unseenNotifications = [];
        targetDoctor.unseenNotifications.push({
            type: 'appointment-transferred',
            message: `Appointment (${appointment.appointmentCode}) transferred to you from ${fromDoctorName}. Note: ${reason || 'N/A'}`,
            data: { appointmentId: appointment._id, appointmentCode: appointment.appointmentCode },
            onClickPath: '/doctor-appointments',
            createdAt: new Date()
        });
        await targetDoctor.save();

        // Notify patient
        if (appointment.userId) {
            const patientUser = await User.findById(appointment.userId);
            if (patientUser) {
                if (!patientUser.unseenNotifications) patientUser.unseenNotifications = [];
                patientUser.unseenNotifications.push({
                    type: 'appointment-transferred',
                    message: `Your appointment (${appointment.appointmentCode}) has been transferred to Dr. ${targetDoctor.name} (${targetDoctor.specialization || 'Specialist'}).`,
                    data: { appointmentId: appointment._id, appointmentCode: appointment.appointmentCode },
                    onClickPath: '/appointments',
                    createdAt: new Date()
                });
                await patientUser.save();
            }
        }

        res.status(200).send({
            success: true,
            message: `Appointment successfully transferred to Dr. ${targetDoctor.name}`,
            data: appointment
        });
    } catch (error) {
        console.error('Error in transferAppointmentController:', error);
        res.status(500).send({
            success: false,
            message: 'Error transferring appointment',
            error: error.message
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
    transferAppointmentController,
    toggleAvailabilityController,
};
