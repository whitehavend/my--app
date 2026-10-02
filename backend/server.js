require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./src/app');
const vendorRoutes = require('./src/routes/vendorRoutes');
const { backfillAdvertPromoCodes } = require('./services/advertPromoService');
const getMongoUri = require('./src/config/mongoUri');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/vendors', vendorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'vendor-verification-backend' });
});

const startServer = async () => {
  try {
    const mongoUri = getMongoUri();
    if (process.env.MONGO_URI && process.env.MONGODB_URI && process.env.MONGO_URI !== process.env.MONGODB_URI) {
      console.warn('Both Mongo URI variables are set; using MONGO_URI.');
    }
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
      const assignedPromoCodes = await backfillAdvertPromoCodes();
      if (assignedPromoCodes) console.log(`Assigned promo codes to ${assignedPromoCodes} existing advertiser(s)`);
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
