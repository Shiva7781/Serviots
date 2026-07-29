const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['desk', 'meeting_room'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
    description: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    pricePerHour: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

spaceSchema.index({ name: 1 });
spaceSchema.index({ type: 1 });
spaceSchema.index({ capacity: 1 });
spaceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Space', spaceSchema);
