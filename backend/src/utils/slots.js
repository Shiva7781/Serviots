const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function slotMinutes() {
  return Number(process.env.SLOT_MINUTES || 30);
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function isValidDate(dateStr) {
  if (!DATE_RE.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

function isValidTime(timeStr) {
  return TIME_RE.test(timeStr);
}

function validateBookingWindow(date, startTime, endTime) {
  if (!isValidDate(date)) return 'Invalid date, expected YYYY-MM-DD';
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return 'Invalid time, expected HH:MM (24h)';
  }
  const step = slotMinutes();
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (startMin % step !== 0 || endMin % step !== 0) {
    return `Start/end time must align to ${step}-minute slots`;
  }
  if (endMin <= startMin) return 'endTime must be after startTime';
  if (endMin > 24 * 60) return 'Booking cannot cross midnight';

  const startDateTime = new Date(`${date}T${startTime}:00`);
  if (startDateTime.getTime() < Date.now()) {
    return 'Cannot book/select a slot in the past';
  }
  return null;
}

/** Returns the list of discrete slot-start strings ("HH:MM") covering [startTime, endTime). */
function buildSlotList(startTime, endTime) {
  const step = slotMinutes();
  const slots = [];
  for (let m = toMinutes(startTime); m < toMinutes(endTime); m += step) {
    slots.push(toHHMM(m));
  }
  return slots;
}

/** True if [aStart,aEnd) overlaps [bStart,bEnd) (same-day HH:MM strings). */
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

module.exports = {
  slotMinutes,
  toMinutes,
  toHHMM,
  isValidDate,
  isValidTime,
  validateBookingWindow,
  buildSlotList,
  rangesOverlap,
};
