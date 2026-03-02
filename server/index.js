const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const medicalRoutes = require('./routes/medical.js');

const app = express();
const server = require('http').createServer(app);
const socketUtil = require('./socket');
const io = socketUtil.init(server);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/animal_care_ngo';

// Middleware
app.use(cors());
app.use(express.json());

// Inject IO into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/medical', medicalRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Serve frontend
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;


