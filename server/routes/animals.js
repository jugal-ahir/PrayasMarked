const express = require('express');
const Animal = require('../models/Animal');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Mark IN (any authenticated user)
router.post('/in', requireAuth, async (req, res) => {
  try {
    const { jobId, species, subspecies, destination, inchargePerson, inAt } = req.body;

    if (!jobId || !species || !destination || !inAt || !inchargePerson) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check if ID exists
    const existing = await Animal.findOne({ jobId });
    if (existing) {
      return res.status(400).json({ message: `Job ID ${jobId} already exists.` });
    }

    const animal = await Animal.create({
      jobId,
      species,
      subspecies,
      destination,
      inchargePerson,
      inAt: new Date(inAt),
      inBy: req.user.name || req.user.email,
      status: 'IN'
    });

    return res.status(201).json(animal);
  } catch (error) {
    console.error('Error marking IN:', error);
    return res.status(500).json({ message: 'Server error while marking IN.' });
  }
});

// Update animal details (any authenticated user)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params; // Original jobId
    const { jobId, species, subspecies, destination, inchargePerson, remark, isTreated } = req.body;

    if (!jobId && !species && !destination && !inchargePerson && remark === undefined && isTreated === undefined) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const animal = await Animal.findOne({ jobId: id });
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found.' });
    }

    if (animal.status !== 'IN') {
      return res.status(400).json({ message: 'Can only edit animals that are currently IN.' });
    }

    // Check availability if changing Job ID
    if (jobId !== id) {
      const exists = await Animal.findOne({ jobId });
      if (exists) {
        return res.status(400).json({ message: `Job ID ${jobId} already exists.` });
      }
    }

    // Update provided fields
    if (jobId) animal.jobId = jobId;
    if (species) animal.species = species;
    if (subspecies !== undefined) animal.subspecies = subspecies;
    if (destination) animal.destination = destination;
    if (inchargePerson) animal.inchargePerson = inchargePerson;
    if (remark !== undefined) animal.remark = remark;
    if (isTreated !== undefined) animal.isTreated = isTreated;

    await animal.save();

    return res.json(animal);
  } catch (error) {
    console.error('Error updating animal:', error);
    return res.status(500).json({ message: 'Server error updating animal.' });
  }
});

// Mark OUT (any authenticated user)
router.post('/out/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { outAt, markOutType, markOutReason } = req.body;

    if (!outAt) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const animal = await Animal.findOne({ jobId: id });
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found.' });
    }

    animal.status = 'OUT';
    animal.outAt = new Date(outAt);
    animal.outBy = req.user.name || req.user.email;
    animal.markOutType = markOutType;
    animal.markOutReason = markOutReason;

    await animal.save();

    return res.json(animal);
  } catch (error) {
    console.error('Error marking OUT:', error);
    return res.status(500).json({ message: 'Server error while marking OUT.' });
  }
});

// Get current IN animals (any authenticated user)
router.get('/in', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const query = { status: 'IN' };

    if (q) {
      const regex = { $regex: q, $options: 'i' };
      query.$or = [
        { jobId: regex },
        { species: regex },
        { subspecies: regex },
        { destination: regex },
        { inBy: regex }
      ];
    }

    const animals = await Animal.find(query).sort({ inAt: -1 });
    return res.json(animals);
  } catch (error) {
    console.error('Error fetching IN animals:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get OUT animals (any authenticated user)
router.get('/out', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const query = { status: 'OUT' };

    if (q) {
      const regex = { $regex: q, $options: 'i' };
      query.$or = [
        { jobId: regex },
        { species: regex },
        { subspecies: regex },
        { destination: regex },
        { inBy: regex },
        { outBy: regex }
      ];
    }

    const animals = await Animal.find(query).sort({ outAt: -1 });
    return res.json(animals);
  } catch (error) {
    console.error('Error fetching OUT animals:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get Statistics (any authenticated user)
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const total = await Animal.countDocuments();
    const totalIn = await Animal.countDocuments({ status: 'IN' });
    const totalOut = await Animal.countDocuments({ status: 'OUT' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIn = await Animal.countDocuments({ inAt: { $gte: today } });
    const todayOut = await Animal.countDocuments({ outAt: { $gte: today } });

    const treatmentIn = await Animal.countDocuments({ status: 'IN', destination: 'Treatment Center' });
    const rehabIn = await Animal.countDocuments({ status: 'IN', destination: 'Rehab Center' });

    res.json({
      total,
      totalIn,
      totalOut,
      todayIn,
      todayOut,
      treatmentIn,
      rehabIn
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// Logs with search and filters (admin only)
router.get('/logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      q, // quick search
      animalId,
      species,
      status,
      destination,
      user,
      fromDate,
      toDate
    } = req.query;

    const conditions = [];

    if (animalId) {
      conditions.push({ jobId: { $regex: animalId, $options: 'i' } });
    }
    if (species) {
      conditions.push({ species: { $regex: species, $options: 'i' } });
    }
    if (status) {
      conditions.push({ status });
    }
    if (destination) {
      conditions.push({ destination: { $regex: destination, $options: 'i' } });
    }
    if (user) {
      // match either IN or OUT user
      conditions.push({
        $or: [
          { inBy: { $regex: user, $options: 'i' } },
          { outBy: { $regex: user, $options: 'i' } }
        ]
      });
    }

    // Quick search across multiple fields (ID, species, users, destination, status)
    if (q) {
      const regex = { $regex: q, $options: 'i' };
      const upper = String(q).toUpperCase();
      const quickOr = [
        { jobId: regex },
        { species: regex },
        { subspecies: regex },
        { destination: regex },
        { inBy: regex },
        { outBy: regex }
      ];
      if (upper === 'IN' || upper === 'OUT') {
        quickOr.push({ status: upper });
      }
      conditions.push({ $or: quickOr });
    }

    // Date range filter on inAt/outAt
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const dateRange = {};
      if (from) dateRange.$gte = from;
      if (to) dateRange.$lte = to;

      conditions.push({
        $or: [{ inAt: dateRange }, { outAt: dateRange }]
      });
    }

    const query = conditions.length ? { $and: conditions } : {};

    const logs = await Animal.find(query).sort({ createdAt: -1 });
    return res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Delete an animal record (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Animal.findOneAndDelete({ jobId: id });
    if (!deleted) {
      return res.status(404).json({ message: 'Animal not found.' });
    }
    return res.json({ message: 'Animal entry deleted.' });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return res.status(500).json({ message: 'Server error while deleting.' });
  }
});

// Export animals to CSV (Admins only)
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclusion of full end day

      query = {
        $or: [
          { inAt: { $gte: start, $lte: end } },
          { outAt: { $gte: start, $lte: end } }
        ]
      };
    }

    const animals = await Animal.find(query).sort({ inAt: -1 });

    const headers = [
      'Job ID', 'Species', 'Subspecies', 'Destination', 'Incharge Person',
      'Status', 'In Date', 'In By', 'Out Date', 'Out By',
      'Mark Out Type', 'Mark Out Reason', 'Remark', 'Treated?'
    ];

    const rows = animals.map(a => [
      a.jobId,
      a.species,
      a.subspecies || '',
      a.destination,
      a.inchargePerson || '',
      a.status,
      a.inAt ? a.inAt.toISOString() : '',
      a.inBy || '',
      a.outAt ? a.outAt.toISOString() : '',
      a.outBy || '',
      a.markOutType || '',
      a.markOutReason || '',
      a.remark || '',
      a.isTreated ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const val = String(cell).replace(/"/g, '""');
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=animal_tracking_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ message: 'Server error during export.' });
  }
});

module.exports = router;


