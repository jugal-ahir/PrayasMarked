const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get history for an animal
router.get('/:jobId', requireAuth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const history = await MedicalRecord.find({ jobId }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({ message: 'Server error fetching history.' });
    }
});

// Add a manual medical event
router.post('/', requireAuth, async (req, res) => {
    try {
        const { jobId, event, description } = req.body;

        if (!jobId || !event || !description) {
            return res.status(400).json({ message: 'Missing fields.' });
        }

        const record = await MedicalRecord.create({
            jobId,
            event,
            description,
            performedBy: req.user.name || req.user.email,
            date: new Date()
        });

        // Emit socket event for real-time history update
        if (req.io) {
            req.io.emit('history_update', { jobId });
        }

        res.status(201).json(record);
    } catch (error) {
        console.error('Error creating medical record:', error);
        res.status(500).json({ message: 'Server error creating record.' });
    }
});

module.exports = router;
