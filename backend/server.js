require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./src/app');
const vendorRoutes = require('./src/routes/vendorRoutes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/vendors', vendorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'vendor-verification-backend' });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
    } else {
      console.warn('MONGODB_URI is not configured. Starting without a database connection.');
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
