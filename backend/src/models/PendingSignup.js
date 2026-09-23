const mongoose = require('mongoose');

const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    verificationCodeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    registration: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.PendingSignup || mongoose.model('PendingSignup', pendingSignupSchema);
