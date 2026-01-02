const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');

const getSiteSettingsController = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
            await settings.save();
        }
        res.status(200).send({
            success: true,
            message: 'Site Settings Fetched',
            data: settings,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching site settings',
            error,
        });
    }
};

const updateSiteSettingsController = async (req, res) => {
    try {
        const { emergencyContact, address, email } = req.body;
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({ emergencyContact, address, email });
        } else {
            settings.emergencyContact = emergencyContact;
            settings.address = address;
            settings.email = email;
        }
        await settings.save();
        res.status(200).send({
            success: true,
            message: 'Site Settings Updated Successfully',
            data: settings,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error updating site settings',
            error,
        });
    }
};


const getAllUsersController = async (req, res) => {
    try {
        const users = await User.find({ role: 'patient' });
        res.status(200).send({
            success: true,
            message: 'Users Data List',
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching users',
            error,
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }); // Or filter by isDoctor/application status
        res.status(200).send({
            success: true,
            message: 'Doctors Data List',
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching doctors',
            error,
        });
    }
};

const changeAccountStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;
        const doctor = await User.findByIdAndUpdate(doctorId, { status });

        const user = await User.findOne({ _id: doctor._id });
        const unseenNotifications = user.unseenNotifications || [];
        unseenNotifications.push({
            type: 'doctor-account-request-updated',
            message: `Your Doctor Account Request Has Been ${status}`,
            onClickPath: '/notification'
        });
        user.isDoctor = status === 'approved' ? true : false;
        await user.save();

        res.status(201).send({
            success: true,
            message: 'Account Status Updated',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Account Status',
            error
        });
    }
};

module.exports = { getAllUsersController, getAllDoctorsController, changeAccountStatusController, getSiteSettingsController, updateSiteSettingsController };
