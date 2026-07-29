const mongoose = require('mongoose');

const slotReservationSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    refType: { type: String, enum: ['booking', 'maintenance'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

// One writer can hold a given (space,date,slot) triple - see bookingController.claimSlots.
slotReservationSchema.index({ space: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('SlotReservation', slotReservationSchema);
