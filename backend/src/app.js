const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://novaunicorn.vercel.app',
  'https://www.novaunicorn.vercel.app',
  'https://my-app-1-ggdw.onrender.com',
  'https://my--app.onrender.com',
  'https://my--app-git-main.whitehavend.vercel.app',
];

const allowedOrigins = (process.env.CLIENT_URL || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat(defaultAllowedOrigins);

const isPrivateNetworkOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return /^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(hostname);
  } catch {
    return false;
  }
};

const isDeployOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com') || hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isPrivateNetworkOrigin(origin) || isDeployOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Unicorn backend is running' });
});

app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong on the server',
  });
});

module.exports = app;
