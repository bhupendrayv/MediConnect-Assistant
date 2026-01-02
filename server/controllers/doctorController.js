const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

const getDoctorInfoController = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.body.userId });
        res.status(200).send({
            success: true,
            message: 'Doctor data fetch success',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Fetching Doctor Details',
        });
    }
};

const updateProfileController = async (req, res) => {
    try {
        const doctor = await User.findOneAndUpdate(
            { _id: req.body.userId },
            req.body,
            { new: true }
        );
        res.status(201).send({
            success: true,
            message: 'Doctor Profile Updated',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Doctor Profile Update Issue',
            error,
        });
    }
};

const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.body.doctorId });
        res.status(200).send({
            success: true,
            message: 'Single Doctor Info Fetched',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Single Doctor Info',
        });
    }
};

const doctorAppointmentsController = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.body.userId });

        // Query directly using the authorized user's ID
        // Use $or to handle potential String vs ObjectId mismatch in database
        // AND fallback to matching by Name if ID fails
        const doctorId = req.body.userId;
        console.log("DoctorAppointments fetched for Doctor ID:", doctorId, "Name:", doctor?.name);

        const appointments = await Appointment.find({
            $or: [
                { doctorId: doctorId },
                { doctorId: new mongoose.Types.ObjectId(doctorId) },
                { 'doctorInfo.name': doctor?.name }
            ]
        }).sort({ createdAt: -1 });

        console.log("Found Appointments:", appointments.length);
        res.status(200).send({
            success: true,
            message: 'Doctor Appointments Fetch Successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Doctor Appointments',
        });
    }
};

const updateStatusController = async (req, res) => {
    try {
        const { appointmentsId, status } = req.body;
        const appointments = await Appointment.findByIdAndUpdate(appointmentsId, { status });
        const user = await User.findOne({ _id: appointments.userId });
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push({
            type: 'status-updated',
            message: `Your appointment has been ${status}`,
            onClickPath: '/appointments'
        });
        await user.save();
        res.status(200).send({
            success: true,
            message: 'Appointment Status Updated',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Update Status',
        });
    }
};

const toggleAvailabilityController = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.body.userId });

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor not found',
            });
        }

        // Toggle the availability status
        doctor.isAvailable = !doctor.isAvailable;
        await doctor.save();

        res.status(200).send({
            success: true,
            message: `You are now ${doctor.isAvailable ? 'Available' : 'Unavailable'}`,
            data: { isAvailable: doctor.isAvailable },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Toggling Availability',
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
