const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Order = require('./models/Order');

const app = express();

const handleMpesaCallback = async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || req.body || {};
    const resultCode = Number(callback.ResultCode ?? callback.resultCode ?? 1);
    const resultDesc = callback.ResultDesc || callback.resultDescription || 'Unknown error';
    const checkoutRequestId = callback.CheckoutRequestID || callback.checkoutRequestId || callback.referenceId;

    if (resultCode === 0) {
      const metadata = callback.CallbackMetadata?.Item || [];
      const callbackData = {};
      metadata.forEach(({ Name, Value }) => {
        if (Name === 'Amount') callbackData.amount = Value;
        if (Name === 'MpesaReceiptNumber') callbackData.mpesaReceiptNumber = Value;
        if (Name === 'TransactionDate') callbackData.transactionDate = Value;
        if (Name === 'PhoneNumber') callbackData.phoneNumber = Value;
      });
      console.log('STK Push success callback received:', callbackData);
    } else {
      console.log('STK Push failed callback:', resultDesc);
    }

    if (checkoutRequestId) {
      const order = await Order.findOne({ paymentReference: checkoutRequestId });
      if (order) {
        const attempt = order.paymentAttempts.find((item) => item.checkoutRequestId === checkoutRequestId);

        if (resultCode === 0) {
          order.paymentStatus = 'paid';
          order.paymentError = '';
          order.status = 'delivered';
          if (attempt) attempt.status = 'paid';
        } else {
          order.paymentStatus = 'insufficient_funds';
          order.paymentError = resultDesc;
          if (attempt) {
            attempt.status = 'insufficient_funds';
            attempt.errorMessage = resultDesc;
          }
        }

        await order.save();
      }
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://novaunicorn.vercel.app',
  'https://www.novaunicorn.vercel.app',
  'https://novaunicon.ink',
  'https://www.novaunicon.ink',
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

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Nova Unicorn API is running', docs: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Unicorn backend is running' });
});

app.post('/api/callback', handleMpesaCallback);
app.post('/api/payments/mpesa-callback', handleMpesaCallback);
app.post('/api/orders/mpesa-callback', handleMpesaCallback);

app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong on the server',
  });
});

module.exports = app;
