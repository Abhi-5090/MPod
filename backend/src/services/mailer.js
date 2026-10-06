const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;
const getTransporter = () => {
  if (!env.mail.user || !env.mail.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: env.mail.user, pass: env.mail.pass },
    });
  }
  return transporter;
};

/** Sends an email. Returns true on success; never throws. */
async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t || !to) return false;
  if (env.isTest) return true;
  try {
    await t.sendMail({ from: env.mail.user, to, subject, text });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send "${subject}":`, err.message);
    return false;
  }
}

/** Fire-and-forget variant for notifications that must not block a request. */
const sendMailInBackground = (opts) => {
  sendMail(opts).catch(() => {});
};

module.exports = { sendMail, sendMailInBackground };
