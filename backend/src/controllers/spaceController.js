const Space = require('../models/Space');
const Booking = require('../models/Booking');
const SlotReservation = require('../models/SlotReservation');
const ApiError = require('../utils/ApiError');
const { slotMinutes, toMinutes, buildSlotList } = require('../utils/slots');

const OPEN_TIME = process.env.OPEN_TIME || '08:00';
const CLOSE_TIME = process.env.CLOSE_TIME || '20:00';

async function list(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const { search, type, minCapacity, date } = req.query;

  const filter = { isActive: true };
  if (search) {
    const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: re }, { type: re }];
  }
  if (type) filter.type = type;
  if (minCapacity) filter.capacity = { $gte: Number(minCapacity) };

  if (date) {
    const fullyBlockedSpaceIds = await getSpacesWithNoAvailability(date);
    filter._id = { $nin: fullyBlockedSpaceIds };
  }

  const [items, total] = await Promise.all([
    Space.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Space.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

async function getSpacesWithNoAvailability(date) {
  const allSlots = buildSlotList(OPEN_TIME, CLOSE_TIME);
  const spaces = await Space.find({ isActive: true }).select('_id');
  const blockingBookings = await Booking.find({
    date,
    type: { $in: ['booking', 'maintenance'] },
    status: { $in: ['pending', 'approved'] },
  }).select('space startTime endTime');

  const bySpace = new Map();
  for (const b of blockingBookings) {
    const key = b.space.toString();
    if (!bySpace.has(key)) bySpace.set(key, []);
    bySpace.get(key).push(b);
  }

  const fullyBlocked = [];
  for (const s of spaces) {
    const bookings = bySpace.get(s._id.toString()) || [];
    const blockedSlots = new Set();
    for (const b of bookings) {
      for (const slot of buildSlotList(b.startTime, b.endTime)) blockedSlots.add(slot);
    }
    const hasFreeSlot = allSlots.some((slot) => !blockedSlots.has(slot));
    if (!hasFreeSlot) fullyBlocked.push(s._id);
  }
  return fullyBlocked;
}

async function getById(req, res) {
  const space = await Space.findById(req.params.id);
  if (!space) throw ApiError.notFound('Space not found');
  res.json({ space });
}

async function availability(req, res) {
  const { id } = req.params;
  const { date } = req.query;

  const space = await Space.findById(id);
  if (!space) throw ApiError.notFound('Space not found');

  const bookings = await Booking.find({
    space: id,
    date,
    status: { $in: ['pending', 'approved'] },
  }).select('startTime endTime status type');

  const slotState = new Map();
  for (const b of bookings) {
    for (const slot of buildSlotList(b.startTime, b.endTime)) {
      // approved/maintenance takes visual precedence over pending
      const existing = slotState.get(slot);
      if (!existing || b.status === 'approved' || b.type === 'maintenance') {
        slotState.set(slot, { status: b.type === 'maintenance' ? 'maintenance' : b.status });
      }
    }
  }

  const allSlots = buildSlotList(OPEN_TIME, CLOSE_TIME);
  const step = slotMinutes();
  const grid = allSlots.map((slot) => ({
    start: slot,
    end: (() => {
      const total = toMinutes(slot) + step;
      const h = String(Math.floor(total / 60)).padStart(2, '0');
      const m = String(total % 60).padStart(2, '0');
      return `${h}:${m}`;
    })(),
    status: slotState.get(slot)?.status || 'available',
  }));

  res.json({ space: { id: space._id, name: space.name }, date, slotMinutes: step, slots: grid });
}

async function create(req, res) {
  const space = await Space.create(req.body);
  res.status(201).json({ space });
}

async function update(req, res) {
  const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!space) throw ApiError.notFound('Space not found');
  res.json({ space });
}

async function remove(req, res) {
  const space = await Space.findByIdAndDelete(req.params.id);
  if (!space) throw ApiError.notFound('Space not found');
  await Promise.all([
    Booking.deleteMany({ space: space._id }),
    SlotReservation.deleteMany({ space: space._id }),
  ]);
  res.status(204).send();
}

async function adminList(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const { search, type } = req.query;

  const filter = {};
  if (search) filter.name = new RegExp(search, 'i');
  if (type) filter.type = type;

  const [items, total] = await Promise.all([
    Space.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Space.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

module.exports = { list, getById, availability, create, update, remove, adminList };
