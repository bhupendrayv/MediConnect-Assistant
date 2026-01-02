const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true
    },
    specialist: {
        type: String,
        required: true
    }
}, { timestamps: true });

const diagnosisModel = mongoose.model('diagnoses', diagnosisSchema);

module.exports = diagnosisModel;
