const { sendMail } = require('../utils/mailer');

const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

async function notifyBookingStatusChange(booking, previousStatus) {
  await booking.populate('user', 'name email');
  await booking.populate('space', 'name');
  if (!booking.user?.email) return;

  const subject = 'Booking Status Updated';
  const text = `Hi ${booking.user.name},

Your booking for ${booking.space?.name || 'a space'} on ${booking.date} (${booking.startTime}-${booking.endTime}) has been updated.

Previous Status: ${STATUS_LABEL[previousStatus] || previousStatus}
Current Status: ${STATUS_LABEL[booking.status] || booking.status}
${booking.reason ? `Reason: ${booking.reason}\n` : ''}
Thank you for choosing us!

Regards,
Booking Team`;

  try {
    await sendMail({ to: booking.user.email, subject, text });
  } catch (err) {
    console.error('[notificationService] failed to send booking status email:', err.message);
  }
}

module.exports = { notifyBookingStatusChange };
