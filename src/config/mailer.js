/**
 * All outbound emails use HTML layouts in ../emails/*.html
 * Meeting subject/body copy can be overridden from CMS Meeting Settings.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAILS_DIR = path.join(__dirname, "../emails");

const TEMPLATES = {
  guest: path.join(EMAILS_DIR, "meeting-guest.html"),
  host: path.join(EMAILS_DIR, "meeting-host.html"),
  contact: path.join(EMAILS_DIR, "contact.html"),
  passwordReset: path.join(EMAILS_DIR, "password-reset.html"),
};

const EMAIL_FONT = "Arial, Helvetica, sans-serif";
const BRAND_NAME = "Sandeep Saliganti";
const BRAND_MARK = "SS";
const DEFAULT_SITE_URL = "https://sandeep-portfolio-089v.onrender.com";
const PORTFOLIO_TAGLINE =
  "Code, creativity, and conversation. See you in our 30-minute session.";

const DEFAULT_GUEST_SUBJECT =
  "Your 30-minute session with {{hostName}} is confirmed.";
// Body only — do not repeat headline/subheadline (those live in the HTML layout)
const DEFAULT_GUEST_BODY = [
  "Hi {{guestName}},",
  "",
  "Thanks for booking a call. I'm looking forward to our conversation — use the Google Meet button below to join at the scheduled time.",
  "",
  "Talk soon,",
  "{{hostName}}",
].join("\n");

const DEFAULT_HOST_SUBJECT = "New booking: {{guestName}} — {{when}}";
const DEFAULT_HOST_BODY = [
  "Hi,",
  "",
  "A new 30-minute session was booked on the portfolio scheduler.",
  "",
  "Guest notes:",
  "{{notes}}",
].join("\n");

function siteUrl() {
  const raw = process.env.SITE_URL || process.env.FRONTEND_URL || DEFAULT_SITE_URL;
  return String(raw).trim().replace(/\/$/, "");
}

function resolveGuestBodyTemplate(settings) {
  const custom = settings.guestEmailBody;
  if (!custom || !String(custom).trim()) return DEFAULT_GUEST_BODY;
  // Old CMS copy repeated headline/tagline — prefer clean default
  if (
    /30-minute session.*confirmed/i.test(custom) ||
    /Code,\s*creativity/i.test(custom)
  ) {
    return DEFAULT_GUEST_BODY;
  }
  return custom;
}

export function createMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PASS) {
    return null;
  }

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

function fillTemplate(template, vars) {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadEmailTemplate(key) {
  const filePath = TEMPLATES[key];
  if (!filePath) throw new Error(`Unknown email template: ${key}`);
  return fs.readFileSync(filePath, "utf8");
}

function bookingTemplateVars(booking, settings) {
  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: booking.timezone || settings.timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(booking.startAt));

  const meetUrl = booking.meetUrl || settings.meetUrl || "";

  return {
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    hostName: settings.hostName,
    title: settings.title,
    subject: booking.subject || "(none)",
    notes: booking.notes || "(no message)",
    when,
    duration: String(booking.durationMin),
    location: booking.locationLabel || settings.locationLabel,
    timezone: booking.timezone || settings.timezone,
    meetUrl,
  };
}

function detailRow(label, value, { last = false, href = "" } = {}) {
  const border = last ? "" : "border-bottom:1px solid #eef0f3;";
  const display = href
    ? `<a href="${escapeHtml(href)}" style="color:#f17a32;text-decoration:underline;word-break:break-all">${escapeHtml(value)}</a>`
    : escapeHtml(value);

  return `
    <tr>
      <td style="padding:10px 0;${border}font-family:${EMAIL_FONT};font-size:0;line-height:0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="118" valign="top" style="font-family:${EMAIL_FONT};font-size:14px;font-weight:400;line-height:1.5;color:#6b7280;padding-right:12px;white-space:nowrap">
              ${escapeHtml(label)}:
            </td>
            <td valign="top" style="font-family:${EMAIL_FONT};font-size:15px;font-weight:500;line-height:1.5;color:#111827">
              ${display}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildMeetingIcs(booking, settings, meetUrl) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const stamp = new Date();

  function icsDate(date) {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  }

  const summary = `${settings.title || "Meeting"} with ${settings.hostName || BRAND_NAME}`;
  const description = [
    booking.subject ? `Subject: ${booking.subject}` : "",
    booking.notes ? `Notes: ${booking.notes}` : "",
    meetUrl ? `Google Meet: ${meetUrl}` : "Google Meet",
  ]
    .filter(Boolean)
    .join("\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sandeep Portfolio//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:meeting-${booking.id}@portfolio`,
    `DTSTAMP:${icsDate(stamp)}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${meetUrl || settings.locationLabel || "Google Meet"}`,
    meetUrl ? `URL:${meetUrl}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

function bodyToHtml(text) {
  const blocks = String(text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return "";

  return blocks
    .map((block, index) => {
      const lines = escapeHtml(block).replace(/\n/g, "<br />");
      const isGreeting =
        index === 0 && !block.includes("\n") && block.length < 48;
      if (isGreeting) {
        return `<p style="margin:0 0 14px;font-family:${EMAIL_FONT};font-size:16px;font-weight:600;line-height:1.6;color:#111827">${lines}</p>`;
      }
      return `<p style="margin:0 0 14px;font-family:${EMAIL_FONT};font-size:16px;font-weight:400;line-height:1.7;color:#374151">${lines}</p>`;
    })
    .join("");
}

function buildCtaBlock(label, href) {
  if (!label || !href) return "";
  return `
    <tr>
      <td align="center" style="padding:16px 40px 8px">
        <a href="${escapeHtml(href)}"
           style="display:inline-block;background:#f17a32;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-family:${EMAIL_FONT};font-size:15px;font-weight:700;line-height:1.2">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 40px 20px">
        <p style="margin:0 0 6px;font-family:${EMAIL_FONT};font-size:13px;font-weight:400;line-height:1.5;color:#9ca3af">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin:0;font-family:${EMAIL_FONT};font-size:13px;font-weight:400;line-height:1.5;word-break:break-all">
          <a href="${escapeHtml(href)}" style="color:#f17a32;text-decoration:underline">${escapeHtml(href)}</a>
        </p>
      </td>
    </tr>`;
}

function formatHourLabel(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total)) return "";
  let hours = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return mins
    ? `${hours}:${String(mins).padStart(2, "0")} ${suffix}`
    : `${hours}:00 ${suffix}`;
}

function helpHoursLabel(settings) {
  const start = formatHourLabel(settings?.dayStartMinutes ?? 540);
  const end = formatHourLabel(settings?.dayEndMinutes ?? 1200);
  const tz = settings?.timezone || "Asia/Kolkata";
  if (start && end) return `Monday – Friday, ${start} – ${end} (${tz})`;
  return `Monday – Friday (${tz})`;
}

function assetUrl(filename) {
  const base = (
    process.env.API_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
  return `${base}/assets/icon/${filename}`;
}

function iconImg(name, alt) {
  // CID so Gmail shows icons; files live in backend/assets/icon
  return `<img src="cid:icon-${name}" width="16" height="16" alt="${escapeHtml(alt)}" style="display:inline-block;width:16px;height:16px;border:0;outline:none;text-decoration:none;vertical-align:middle" />`;
}

function meetingIconAttachments() {
  const names = ["email", "portfolio", "clock", "linkedin", "github"];
  const iconDir = path.join(__dirname, "../../assets/icon");
  return names.map((name) => ({
    filename: `${name}.png`,
    path: path.join(iconDir, `${name}.png`),
    cid: `icon-${name}`,
    contentDisposition: "inline",
    contentType: "image/png",
  }));
}

function footerLayoutVars(settings) {
  const portfolio = siteUrl();
  const helpEmail =
    process.env.MAIL_FROM ||
    process.env.MAIL_TO ||
    process.env.SMTP_USER ||
    "saligantisandeepzzz6@gmail.com";
  const linkedin =
    process.env.SOCIAL_LINKEDIN || "https://www.linkedin.com/";
  const github = process.env.SOCIAL_GITHUB || "https://github.com/";

  return {
    helpEmail: escapeHtml(helpEmail),
    helpHours: escapeHtml(helpHoursLabel(settings)),
    siteUrl: escapeHtml(portfolio),
    siteUrlLabel: escapeHtml(portfolio.replace(/^https?:\/\//, "")),
    linkedinUrl: escapeHtml(linkedin),
    githubUrl: escapeHtml(github),
    privacyUrl: escapeHtml(`${portfolio}/`),
    termsUrl: escapeHtml(`${portfolio}/`),
    iconEmail: iconImg("email", "Email"),
    iconPortfolio: iconImg("portfolio", "Portfolio"),
    iconClock: iconImg("clock", "Hours"),
    iconLinkedin: iconImg("linkedin", "LinkedIn"),
    iconGithub: iconImg("github", "GitHub"),
    // Public URLs (also served at /assets/icon/*.png)
    assetEmailUrl: escapeHtml(assetUrl("email.png")),
    assetPortfolioUrl: escapeHtml(assetUrl("portfolio.png")),
    assetClockUrl: escapeHtml(assetUrl("clock.png")),
    assetLinkedinUrl: escapeHtml(assetUrl("linkedin.png")),
    assetGithubUrl: escapeHtml(assetUrl("github.png")),
  };
}

function hostInitials(settings) {
  return String(
    settings?.hostInitials ||
      String(settings?.hostName || BRAND_MARK)
        .split(/\s+/)
        .map((part) => part[0] || "")
        .join("") ||
      BRAND_MARK,
  )
    .slice(0, 2)
    .toUpperCase();
}

function buildMeetingEmailHtml({
  headline,
  subheadline,
  bodyText,
  vars,
  settings,
  ctaLabel,
  ctaHref,
  role,
}) {
  const detailRows = [];

  if (role === "host") {
    detailRows.push({
      label: "Guest",
      value: `${vars.guestName} <${vars.guestEmail}>`,
    });
    if (vars.subject && vars.subject !== "(none)") {
      detailRows.push({ label: "Subject", value: vars.subject });
    }
  }

  detailRows.push(
    { label: "When", value: vars.when },
    { label: "Duration", value: `${vars.duration} min` },
    { label: "Where", value: vars.location },
    { label: "Timezone", value: vars.timezone },
  );

  if (vars.meetUrl) {
    detailRows.push({
      label: "Google Meet",
      value: vars.meetUrl,
      href: vars.meetUrl,
    });
  }

  const detailsHtml = detailRows
    .map((row, index) =>
      detailRow(row.label, row.value, {
        last: index === detailRows.length - 1,
        href: row.href || "",
      }),
    )
    .join("");

  const layoutVars = {
    headline: escapeHtml(headline),
    subheadline: escapeHtml(subheadline),
    bodyHtml: bodyToHtml(bodyText),
    detailsHtml,
    ctaBlock: buildCtaBlock(ctaLabel, ctaHref),
    hostName: escapeHtml(settings.hostName || BRAND_NAME),
    hostInitials: escapeHtml(hostInitials(settings)),
    year: String(new Date().getFullYear()),
    ...footerLayoutVars(settings),
  };

  return fillTemplate(loadEmailTemplate(role), layoutVars);
}

function buildContactEmailHtml(message) {
  const rows = [
    { label: "Name", value: message.name },
    { label: "Email", value: message.email },
    { label: "Subject", value: message.subject || "(none)" },
  ];

  const detailsHtml = rows
    .map((row, index) =>
      detailRow(row.label, row.value, { last: index === rows.length - 1 }),
    )
    .join("");

  return fillTemplate(loadEmailTemplate("contact"), {
    headline: escapeHtml("New portfolio message"),
    subheadline: escapeHtml(`From ${message.name}`),
    detailsHtml,
    bodyHtml: bodyToHtml(message.body || "(empty message)"),
    ctaBlock: buildCtaBlock(`Reply to ${message.name}`, `mailto:${message.email}`),
    brandMark: escapeHtml(BRAND_MARK),
    brandName: escapeHtml(BRAND_NAME),
    year: String(new Date().getFullYear()),
  });
}

function buildPasswordResetEmailHtml({ resetUrl }) {
  return fillTemplate(loadEmailTemplate("passwordReset"), {
    headline: escapeHtml("Reset your password"),
    subheadline: escapeHtml("Portfolio CMS account"),
    bodyHtml: bodyToHtml(
      "You requested a password reset for the Portfolio CMS.\n\nClick the button below to choose a new password.",
    ),
    ctaBlock: buildCtaBlock("Choose a new password", resetUrl),
    noticeText: escapeHtml(
      "This link expires in 30 minutes. If you did not request this, you can ignore this email.",
    ),
    brandMark: escapeHtml(BRAND_MARK),
    brandName: escapeHtml(BRAND_NAME),
    year: String(new Date().getFullYear()),
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
  const text = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Subject: ${message.subject || "(none)"}`,
    "",
    message.body,
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    replyTo: message.email || undefined,
    subject: message.subject || `Portfolio message from ${message.name}`,
    text,
    html: buildContactEmailHtml(message),
  });

  return { sent: true };
}

export async function sendMeetingNotification(booking, settings) {
  const transporter = createMailer();

  if (!transporter) {
    console.warn("[mailer] SMTP not configured — skipping meeting email.");
    return {
      sent: false,
      reason: "SMTP not configured",
      guest: false,
      host: false,
    };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const hostTo = process.env.MAIL_TO || process.env.SMTP_USER;
  const vars = bookingTemplateVars(booking, settings);
  const portfolioUrl = siteUrl();
  const meetUrl = vars.meetUrl;
  const ics = buildMeetingIcs(booking, settings, meetUrl);
  const icsAttachment = {
    filename: "meeting.ics",
    content: ics,
    contentType: "text/calendar; charset=utf-8; method=REQUEST",
  };

  const guestSubject = fillTemplate(
    settings.guestEmailSubject || DEFAULT_GUEST_SUBJECT,
    vars,
  );
  const guestBody = fillTemplate(resolveGuestBodyTemplate(settings), vars);
  const hostSubject = fillTemplate(
    settings.hostEmailSubject || DEFAULT_HOST_SUBJECT,
    vars,
  );
  const hostBody = fillTemplate(
    settings.hostEmailBody || DEFAULT_HOST_BODY,
    vars,
  );

  const guestHtml = buildMeetingEmailHtml({
    headline: `Your 30-minute session with ${settings.hostName} is confirmed.`,
    subheadline: PORTFOLIO_TAGLINE,
    bodyText: guestBody,
    vars,
    settings,
    ctaLabel: meetUrl ? "Join Google Meet" : "Open portfolio",
    ctaHref: meetUrl || portfolioUrl,
    role: "guest",
  });

  const hostHtml = buildMeetingEmailHtml({
    headline: "New meeting booking",
    subheadline: `${vars.guestName} booked a 30-minute session`,
    bodyText: hostBody,
    vars,
    settings,
    ctaLabel: meetUrl ? "Join Google Meet" : `Reply to ${vars.guestName}`,
    ctaHref: meetUrl || `mailto:${vars.guestEmail}`,
    role: "host",
  });

  const result = { sent: true, guest: false, host: false, meetUrl: meetUrl || null };
  const iconAttachments = meetingIconAttachments();
  const mailAttachments = [...iconAttachments, icsAttachment];

  if (booking.guestEmail) {
    await transporter.sendMail({
      from,
      to: booking.guestEmail,
      subject: guestSubject,
      text: [
        guestBody,
        "",
        meetUrl ? `Google Meet: ${meetUrl}` : "",
        `Portfolio: ${portfolioUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
      html: guestHtml,
      attachments: mailAttachments,
    });
    result.guest = true;
  }

  if (hostTo) {
    await transporter.sendMail({
      from,
      to: hostTo,
      replyTo: booking.guestEmail || undefined,
      subject: hostSubject,
      text: [
        hostBody,
        "",
        meetUrl ? `Google Meet: ${meetUrl}` : "",
        `Guest: ${vars.guestName} <${vars.guestEmail}>`,
      ]
        .filter(Boolean)
        .join("\n"),
      html: hostHtml,
      attachments: mailAttachments,
    });
    result.host = true;
  }

  return result;
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
    html: buildPasswordResetEmailHtml({ resetUrl }),
  });

  return { sent: true };
}

export const meetingEmailDefaults = {
  guestEmailSubject: DEFAULT_GUEST_SUBJECT,
  guestEmailBody: DEFAULT_GUEST_BODY,
  hostEmailSubject: DEFAULT_HOST_SUBJECT,
  hostEmailBody: DEFAULT_HOST_BODY,
};
