import nodemailer from "nodemailer";

export function createMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PASS) {
    return null;
  }

  // Gmail and most SMTP providers expect the mailbox address as the auth user.
  const user =
    SMTP_USER && SMTP_USER.includes("@")
      ? SMTP_USER
      : MAIL_FROM && MAIL_FROM.includes("@")
        ? MAIL_FROM
        : SMTP_USER;

  if (!user) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user,
      pass: SMTP_PASS,
    },
  });
}

export async function sendContactNotification(message) {
  const transporter = createMailer();

  if (!transporter) {
    console.warn("[mailer] SMTP not configured — skipping email send.");
    return { sent: false, reason: "SMTP not configured" };
  }

  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: message.subject || `Portfolio message from ${message.name}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Subject: ${message.subject || "(none)"}`,
      "",
      message.body,
    ].join("\n"),
  });

  return { sent: true };
}

export async function sendMeetingNotification(booking, settings) {
  const transporter = createMailer();

  if (!transporter) {
    console.warn("[mailer] SMTP not configured — skipping meeting email.");
    return { sent: false, reason: "SMTP not configured" };
  }

  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: booking.timezone || settings.timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(booking.startAt));

  await transporter.sendMail({
    from,
    to,
    subject:
      booking.subject ||
      `New meeting: ${settings.title} with ${booking.guestName}`,
    text: [
      `Host: ${settings.hostName}`,
      `Guest: ${booking.guestName} <${booking.guestEmail}>`,
      `Subject: ${booking.subject || "(none)"}`,
      `When: ${when} (${booking.timezone})`,
      `Duration: ${booking.durationMin} min`,
      `Location: ${booking.locationLabel || settings.locationLabel}`,
      "",
      booking.notes || "(no message)",
    ].join("\n"),
  });

  return { sent: true };
}

export async function sendPasswordResetEmail({ email, resetUrl }) {
  const transporter = createMailer();

  if (!transporter) {
    console.warn("[mailer] SMTP not configured — password reset email skipped.");
    return { sent: false, reason: "SMTP not configured" };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your Portfolio CMS password",
    text: [
      "You requested a password reset for the Portfolio CMS.",
      "",
      `Open this link to choose a new password:`,
      resetUrl,
      "",
      "This link expires in 30 minutes.",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;max-width:480px">
        <h2 style="margin:0 0 12px;font-size:18px">Reset your password</h2>
        <p style="margin:0 0 16px;color:#52525b">
          You requested a password reset for the Portfolio CMS.
        </p>
        <p style="margin:0 0 20px">
          <a href="${resetUrl}"
             style="display:inline-block;background:#f17a32;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">
            Choose a new password
          </a>
        </p>
        <p style="margin:0;font-size:13px;color:#71717a">
          This link expires in 30 minutes. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });

  return { sent: true };
}

