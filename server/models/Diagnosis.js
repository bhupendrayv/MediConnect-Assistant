const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    symptoms: {
        type: String,
        required: true,
    },
    disease: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        required: true,
    },
    specialist: {
        type: String,
        required: true,
    },
    solution: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis;
