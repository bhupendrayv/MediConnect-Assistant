const User = require('../models/User');
const Appointment = require('../models/Appointment');
const BloodRequest = require('../models/BloodRequest');
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

// Direct Doctor Creation by Admin
const addDoctorController = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            specialization,
            experience,
            feesPerConsultation,
            timings,
            bio,
            services
        } = req.body;

        if (!name || !email || !password || !specialization || !feesPerConsultation) {
            return res.status(400).send({
                success: false,
                message: 'Name, email, password, specialization, and consultation fees are required.'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }

        const newDoctor = new User({
            name,
            email: email.toLowerCase().trim(),
            password,
            phone: phone || '',
            address: address || '',
            specialization,
            experience: experience || '1+ Years',
            feesPerConsultation: Number(feesPerConsultation),
            timings: timings || { start: '09:00', end: '17:00' },
            bio: bio || `Specialist in ${specialization}`,
            services: services || [{ name: 'Standard Consultation', price: Number(feesPerConsultation) }],
            role: 'doctor',
            isDoctor: true,
            status: 'approved',
            isAvailable: true,
            unseenNotifications: [{
                type: 'admin-welcome',
                message: 'Welcome Dr. ' + name + '! Your verified doctor account has been created by the administrator.',
                createdAt: new Date()
            }]
        });

        await newDoctor.save();

        res.status(201).send({
            success: true,
            message: `Doctor Dr. ${name} created and activated successfully!`,
            data: newDoctor
        });
    } catch (error) {
        console.error('Error in addDoctorController:', error);
        res.status(500).send({
            success: false,
            message: 'Error creating doctor account',
            error: error.message
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

// Get Admin Overview Stats & Analytics
const getAdminOverviewStatsController = async (req, res) => {
    try {
        const [totalPatients, totalDoctors, pendingDoctors, totalAppointments, bloodRequests] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'doctor', status: 'approved' }),
            User.countDocuments({ role: 'doctor', status: 'pending' }),
            Appointment.find().select('totalAmount paymentStatus status createdAt'),
            BloodRequest.countDocuments({ status: 'pending' })
        ]);

        const completedAppointments = totalAppointments.filter(a => a.status === 'completed' || a.status === 'approved').length;
        const cancelledAppointments = totalAppointments.filter(a => a.status === 'cancelled').length;
        const totalRevenue = totalAppointments
            .filter(a => a.paymentStatus === 'paid')
            .reduce((sum, a) => sum + (Number(a.totalAmount) || 0), 0);

        res.status(200).send({
            success: true,
            message: 'Admin overview stats calculated successfully',
            data: {
                totalPatients,
                totalDoctors,
                pendingDoctors,
                totalAppointmentsCount: totalAppointments.length,
                completedAppointments,
                cancelledAppointments,
                totalRevenue,
                pendingBloodRequests: bloodRequests,
                recentAppointments: totalAppointments.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Error in getAdminOverviewStatsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error calculating admin overview stats',
            error: error.message
        });
    }
};

// Get All Appointments (Global Ledger)
const getAllAppointmentsController = async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'Appointments fetched successfully',
            data: appointments
        });
    } catch (error) {
        console.error('Error in getAllAppointmentsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error fetching global appointments',
            error: error.message
        });
    }
};

// Broadcast Notification to Users / Doctors
const broadcastNotificationController = async (req, res) => {
    try {
        const { title, message: broadcastMsg, targetGroup } = req.body;

        if (!title || !broadcastMsg) {
            return res.status(400).send({
                success: false,
                message: 'Title and message are required for broadcast.'
            });
        }

        let query = {};
        if (targetGroup === 'doctors') {
            query = { role: 'doctor' };
        } else if (targetGroup === 'patients') {
            query = { role: 'patient' };
        }

        const notificationObj = {
            type: 'admin-broadcast',
            title,
            message: broadcastMsg,
            sender: 'Hospital Administration',
            createdAt: new Date(),
            onClickPath: '/notification'
        };

        const result = await User.updateMany(query, {
            $push: { unseenNotifications: notificationObj }
        });

        res.status(200).send({
            success: true,
            message: `Broadcast message sent to ${result.modifiedCount} accounts.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in broadcastNotificationController:', error);
        res.status(500).send({
            success: false,
            message: 'Error broadcasting notification',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsersController,
    getAllDoctorsController,
    addDoctorController,
    changeAccountStatusController,
    getSiteSettingsController,
    updateSiteSettingsController,
    getAdminOverviewStatsController,
    getAllAppointmentsController,
    broadcastNotificationController
};

