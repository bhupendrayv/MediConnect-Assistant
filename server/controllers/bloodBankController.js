const BloodRequest = require('../models/BloodRequest');

// Create a new blood request
const requestBloodController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { patientName, bloodGroup, units, hospitalName, address, neededBy, contactNumber, reason } = req.body;

        if (!patientName || !bloodGroup || !hospitalName || !address || !neededBy || !contactNumber) {
            return res.status(400).send({
                success: false,
                message: 'All blood request fields are required'
            });
        }

        const newRequest = new BloodRequest({
            userId,
            patientName: patientName.trim(),
            bloodGroup,
            units: Number(units) || 1,
            hospitalName: hospitalName.trim(),
            address: address.trim(),
            neededBy,
            contactNumber: contactNumber.trim(),
            reason: reason || '',
            status: 'pending'
        });

        await newRequest.save();

        res.status(201).send({
            success: true,
            message: 'Blood request submitted successfully',
            data: newRequest
        });
    } catch (error) {
        console.error('Error in requestBloodController:', error);
        res.status(500).send({
            success: false,
            message: 'Error submitting blood request',
            error: error.message
        });
    }
};

// Get blood requests made by specific user
const getBloodRequestsController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const requests = await BloodRequest.find({ userId }).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'Blood requests fetched successfully',
            data: requests
        });
    } catch (error) {
        console.error('Error in getBloodRequestsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in fetching blood requests',
            error: error.message
        });
    }
};

// Get all blood requests (for admin / public directory)
const getAllBloodRequestsController = async (req, res) => {
    try {
        const requests = await BloodRequest.find({}).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'All blood requests fetched successfully',
            data: requests
        });
    } catch (error) {
        console.error('Error in getAllBloodRequestsController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in fetching all blood requests',
            error: error.message
        });
    }
};

// Update status of blood request (approved, fulfilled, rejected)
const updateBloodStatusController = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        if (!requestId || !status) {
            return res.status(400).send({
                success: false,
                message: 'requestId and status are required'
            });
        }

        const request = await BloodRequest.findByIdAndUpdate(requestId, { status }, { new: true });
        if (!request) {
            return res.status(404).send({
                success: false,
                message: 'Blood request not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Blood request status updated successfully',
            data: request
        });
    } catch (error) {
        console.error('Error in updateBloodStatusController:', error);
        res.status(500).send({
            success: false,
            message: 'Error in updating blood request status',
            error: error.message
        });
    }
};

module.exports = {
    requestBloodController,
    getBloodRequestsController,
    getAllBloodRequestsController,
    updateBloodStatusController
};
