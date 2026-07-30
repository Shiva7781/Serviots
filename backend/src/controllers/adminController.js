const Booking = require('../models/Booking');
const Space = require('../models/Space');
const ApiError = require('../utils/ApiError');
const { validateBookingWindow, buildSlotList, rangesOverlap } = require('../utils/slots');
const { claimSlots, releaseSlots } = require('./bookingController');
const { notifyBookingStatusChange } = require('../services/notificationService');

async function listBookings(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) filter.date = req.query.date;
  if (req.query.space) filter.space = req.query.space;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('space', 'name type capacity')
      .populate('user', 'name email')
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

async function approve(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.type !== 'booking') throw ApiError.notFound('Booking not found');
  if (booking.status !== 'pending') {
    throw ApiError.badRequest(`Only pending bookings can be approved (current: ${booking.status})`);
  }

  booking.status = 'approved';
  booking.createdBy = req.user.id;
  await booking.save();
  // Not awaited: SMTP delivery can take tens of seconds (observed with real
  // Gmail SMTP), and that latency shouldn't block the booking response -
  // notifyBookingStatusChange already catches its own errors internally.
  notifyBookingStatusChange(booking, 'pending');

  // Defensive net: slot creation already blocks overlapping pending bookings,
  // so this should normally match nothing - kept to guarantee the invariant.
  const others = await Booking.find({
    _id: { $ne: booking._id },
    space: booking.space,
    date: booking.date,
    type: 'booking',
    status: 'pending',
  });

  const autoRejected = [];
  for (const other of others) {
    if (rangesOverlap(booking.startTime, booking.endTime, other.startTime, other.endTime)) {
      other.status = 'rejected';
      other.reason = 'Auto-rejected: overlapping slot was approved for another booking';
      await other.save();
      await releaseSlots(other._id);
      notifyBookingStatusChange(other, 'pending');
      autoRejected.push(other._id);
    }
  }

  res.json({ booking, autoRejected });
}

async function reject(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.type !== 'booking') throw ApiError.notFound('Booking not found');
  if (booking.status !== 'pending') {
    throw ApiError.badRequest(`Only pending bookings can be rejected (current: ${booking.status})`);
  }

  booking.status = 'rejected';
  booking.reason = req.body.reason || '';
  booking.createdBy = req.user.id;
  await booking.save();
  await releaseSlots(booking._id);
  notifyBookingStatusChange(booking, 'pending');

  res.json({ booking });
}

async function createMaintenance(req, res) {
  const { space: spaceId, date, startTime, endTime, reason } = req.body;

  const space = await Space.findById(spaceId);
  if (!space) throw ApiError.notFound('Space not found');

  const windowError = validateBookingWindow(date, startTime, endTime);
  if (windowError) throw ApiError.badRequest(windowError);

  const slots = buildSlotList(startTime, endTime);

  const block = await Booking.create({
    space: spaceId,
    user: null,
    type: 'maintenance',
    date,
    startTime,
    endTime,
    status: 'approved',
    reason: reason || 'Maintenance',
    createdBy: req.user.id,
  });

  const claimed = await claimSlots(spaceId, date, slots, 'maintenance', block._id);
  if (!claimed) {
    await Booking.deleteOne({ _id: block._id });
    throw ApiError.conflict('Requested maintenance window overlaps an existing booking or block.');
  }

  res.status(201).json({ maintenance: block });
}

async function listMaintenance(req, res) {
  const filter = { type: 'maintenance' };
  if (req.query.space) filter.space = req.query.space;
  if (req.query.date) filter.date = req.query.date;
  const items = await Booking.find(filter).populate('space', 'name type').sort({ date: -1 });
  res.json({ items });
}

async function removeMaintenance(req, res) {
  const block = await Booking.findOne({ _id: req.params.id, type: 'maintenance' });
  if (!block) throw ApiError.notFound('Maintenance block not found');
  await Booking.deleteOne({ _id: block._id });
  await releaseSlots(block._id);
  res.status(204).send();
}

module.exports = {
  listBookings,
  approve,
  reject,
  createMaintenance,
  listMaintenance,
  removeMaintenance,
};
