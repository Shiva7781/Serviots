const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// Sends real email when SMTP_* env vars are set; otherwise logs the message
// to the console so the notification flow can be exercised without any
// email provider set up.
async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`[mailer:stub] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
