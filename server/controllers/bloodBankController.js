const bloodRequestModel = require('../models/BloodRequest');

const requestBloodController = async (req, res) => {
    try {
        const newRequest = new bloodRequestModel(req.body);
        await newRequest.save();
        res.status(201).send({
            success: true,
            message: 'Blood Request Sent Successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Requesting Blood',
            error
        });
    }
};

const getBloodRequestsController = async (req, res) => {
    try {
        const requests = await bloodRequestModel.find({ userId: req.body.userId }).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'Blood Requests Fetched Successfully',
            data: requests
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching Blood Requests',
            error
        });
    }
};

const getAllBloodRequestsController = async (req, res) => {
    try {
        const requests = await bloodRequestModel.find({}).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'All Blood Requests Fetched Successfully',
            data: requests
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching All Blood Requests',
            error
        });
    }
};

const updateBloodStatusController = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        const request = await bloodRequestModel.findByIdAndUpdate(requestId, { status }, { new: true });
        res.status(200).send({
            success: true,
            message: 'Blood Request Status Updated',
            data: request
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Updating Blood Request Status',
            error
        });
    }
};

module.exports = {
    requestBloodController,
    getBloodRequestsController,
    getAllBloodRequestsController,
    updateBloodStatusController
};
