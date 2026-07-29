const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    type: { type: String, enum: ['booking', 'maintenance'], default: 'booking', index: true },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    startTime: { type: String, required: true }, // 'HH:MM' 24h
    endTime: { type: String, required: true }, // 'HH:MM' 24h
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    purpose: { type: String, trim: true, default: '' },
    reason: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ space: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
