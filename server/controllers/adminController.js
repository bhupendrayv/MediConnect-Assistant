const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');

// Get site settings (public or admin)
const getSiteSettingsController = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({
                emergencyContact: '+91 1234567890',
                address: '123, Health Street, Medical District, City - 400001',
                email: 'medi.connectofficial2026@gmail.com'
            });
            await settings.save();
        }
        res.status(200).send({
            success: true,
            message: 'Site settings fetched successfully',
            data: settings,
        });
    } catch (error) {
        console.error('Error in getSiteSettingsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error fetching site settings',
            error: error.message,
        });
    }
};

// Update site settings (admin only)
const updateSiteSettingsController = async (req, res) => {
    try {
        const { emergencyContact, address, email } = req.body;
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({ emergencyContact, address, email });
        } else {
            if (emergencyContact !== undefined) settings.emergencyContact = emergencyContact;
            if (address !== undefined) settings.address = address;
            if (email !== undefined) settings.email = email;
        }
        await settings.save();
        res.status(200).send({
            success: true,
            message: 'Site settings updated successfully',
            data: settings,
        });
    } catch (error) {
        console.error('Error in updateSiteSettingsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error updating site settings',
            error: error.message,
        });
    }
};

// Get all registered users (patients)
const getAllUsersController = async (req, res) => {
    try {
        const users = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Error in getAllUsersController:', error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching users',
            error: error.message,
        });
    }
};

// Get all doctors (pending & approved)
const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await User.find({
            $or: [{ role: 'doctor' }, { isDoctor: true }, { status: { $in: ['pending', 'approved', 'rejected'] } }]
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'Doctors fetched successfully',
            data: doctors,
        });
    } catch (error) {
        console.error('Error in getAllDoctorsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching doctors',
            error: error.message,
        });
    }
};

// Approve, reject, or suspend doctor account
const changeAccountStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;

        if (!doctorId || !status) {
            return res.status(400).send({
                success: false,
                message: 'doctorId and status are required'
            });
        }

        const isApproved = status === 'approved';
        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                status,
                isDoctor: isApproved,
                role: isApproved ? 'doctor' : 'patient'
            },
            { new: true }
        ).select('-password');

        if (!updatedDoctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Send notification to doctor
        if (!updatedDoctor.unseenNotifications) updatedDoctor.unseenNotifications = [];
        updatedDoctor.unseenNotifications.push({
            type: 'doctor-account-status-updated',
            message: `Your doctor account request has been ${status}`,
            data: {
                status,
                onClickPath: isApproved ? '/doctor/profile/' + updatedDoctor._id : '/apply-doctor'
            },
            createdAt: new Date()
        });
        await updatedDoctor.save();

        res.status(200).send({
            success: true,
            message: `Doctor account status changed to ${status}`,
            data: updatedDoctor,
        });
    } catch (error) {
        console.error('Error in changeAccountStatusController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in changing account status',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsersController,
    getAllDoctorsController,
    changeAccountStatusController,
    getSiteSettingsController,
    updateSiteSettingsController
};
