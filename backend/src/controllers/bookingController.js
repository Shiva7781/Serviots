const Booking = require('../models/Booking');
const SlotReservation = require('../models/SlotReservation');
const Space = require('../models/Space');
const ApiError = require('../utils/ApiError');
const { validateBookingWindow, buildSlotList } = require('../utils/slots');

// Relies on the unique {space,date,slot} index on SlotReservation as the
// concurrency guard: only one of two racing insertMany calls can win a given
// slot, the loser gets an E11000 and rolls back below. Works on a standalone
// mongod, unlike multi-document transactions which need a replica set.
async function claimSlots(spaceId, date, slots, refType, refId) {
  const docs = slots.map((slot) => ({ space: spaceId, date, slot, refType, refId }));
  try {
    await SlotReservation.insertMany(docs, { ordered: true });
    return true;
  } catch (err) {
    await SlotReservation.deleteMany({ refId });
    if (err.code === 11000) return false;
    throw err;
  }
}

async function releaseSlots(refId) {
  await SlotReservation.deleteMany({ refId });
}

async function create(req, res) {
  const { space: spaceId, date, startTime, endTime, purpose } = req.body;

  const space = await Space.findById(spaceId);
  if (!space || !space.isActive) throw ApiError.notFound('Space not found or inactive');

  const windowError = validateBookingWindow(date, startTime, endTime);
  if (windowError) throw ApiError.badRequest(windowError);

  const slots = buildSlotList(startTime, endTime);

  const booking = await Booking.create({
    space: spaceId,
    user: req.user.id,
    date,
    startTime,
    endTime,
    purpose,
    status: 'pending',
    type: 'booking',
  });

  const claimed = await claimSlots(spaceId, date, slots, 'booking', booking._id);
  if (!claimed) {
    await Booking.deleteOne({ _id: booking._id });
    throw ApiError.conflict(
      'One or more of the selected time slots is already booked or pending for this space.'
    );
  }

  res.status(201).json({ booking });
}

async function myBookings(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const filter = { user: req.user.id, type: 'booking' };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('space', 'name type capacity')
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

async function cancel(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.type !== 'booking') throw ApiError.notFound('Booking not found');
  if (booking.user.toString() !== req.user.id) throw ApiError.forbidden('Not your booking');
  if (!['pending', 'approved'].includes(booking.status)) {
    throw ApiError.badRequest(`Cannot cancel a booking with status "${booking.status}"`);
  }

  const startDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
  if (startDateTime.getTime() < Date.now()) {
    throw ApiError.badRequest('Cannot cancel a booking that has already started/passed');
  }

  booking.status = 'cancelled';
  await booking.save();
  await releaseSlots(booking._id);

  res.json({ booking });
}

module.exports = { create, myBookings, cancel, claimSlots, releaseSlots };
