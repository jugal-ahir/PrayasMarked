const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            index: true
        },
        event: {
            type: String, // e.g., 'Admission', 'Status Change', 'Treatment', 'Move', 'Mark OUT'
            required: true
        },
        description: {
            type: String,
            required: true
        },
        performedBy: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
