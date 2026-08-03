import prisma from "../config/prisma.js";
import {
  meetingEmailDefaults,
  sendMeetingNotification,
} from "../config/mailer.js";
import { httpError } from "../middlewares/errorHandler.js";
import {
  createGoogleMeetEvent,
  resolveConfiguredMeetUrl,
} from "../utils/googleMeet.js";

const defaultSettings = {
  hostName: "Sandeep Saliganti",
  hostInitials: "SS",
  hostImageUrl: null,
  title: "30 min meeting",
  durations: [30, 60],
  locationLabel: "Google Meet",
  meetUrl: null,
  timezone: "Asia/Kolkata",
  workDays: [1, 2, 3, 4, 5],
  dayStartMinutes: 540,
  dayEndMinutes: 1200,
  slotIntervalMin: 30,
  bufferMinutes: 0,
  bookingWindowDays: 60,
  isActive: true,
  ...meetingEmailDefaults,
};

const settingsFields = [
  "hostName",
  "hostInitials",
  "hostImageUrl",
  "title",
  "durations",
  "locationLabel",
  "meetUrl",
  "timezone",
  "workDays",
  "dayStartMinutes",
  "dayEndMinutes",
  "slotIntervalMin",
  "bufferMinutes",
  "bookingWindowDays",
  "isActive",
  "guestEmailSubject",
  "guestEmailBody",
  "hostEmailSubject",
  "hostEmailBody",
];

const templateFields = new Set([
  "guestEmailSubject",
  "guestEmailBody",
  "hostEmailSubject",
  "hostEmailBody",
  "hostImageUrl",
  "meetUrl",
]);

function parseIntList(value) {
  if (Array.isArray(value)) {
    return value.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  }
  return undefined;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateKey(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: weekdayMap[map.weekday],
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function zonedLocalToUtc(dateKey, minutes, timeZone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const guess = new Date(Date.UTC(year, month - 1, day, hours, mins, 0));

  for (let i = 0; i < 3; i += 1) {
    const parts = getZonedParts(guess, timeZone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0,
    );
    const wanted = Date.UTC(year, month - 1, day, hours, mins, 0);
    guess.setTime(guess.getTime() + (wanted - asUtc));
  }

  return guess;
}

function formatSlotLabel(minutes, hour12) {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hour12) return `${pad2(hours)}:${pad2(mins)}`;

  const suffix = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${pad2(mins)}${suffix}`;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function ensureMeetingSettings() {
  let row = await prisma.meetingSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!row) {
    row = await prisma.meetingSettings.create({ data: defaultSettings });
  }
  return row;
}

export async function getMeetingSettings() {
  return ensureMeetingSettings();
}

export async function updateMeetingSettings(body = {}) {
  const data = {};
  for (const key of settingsFields) {
    if (body[key] === undefined) continue;
    if (key === "durations" || key === "workDays") {
      data[key] = parseIntList(body[key]);
    } else if (
      key === "dayStartMinutes" ||
      key === "dayEndMinutes" ||
      key === "slotIntervalMin" ||
      key === "bufferMinutes" ||
      key === "bookingWindowDays"
    ) {
      data[key] = Number(body[key]);
    } else if (key === "isActive") {
      data[key] = body[key] === true || body[key] === "true";
    } else if (templateFields.has(key)) {
      const value = body[key];
      data[key] =
        value === null || value === "" ? null : String(value);
    } else {
      data[key] = body[key];
    }
  }

  let row = await prisma.meetingSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!row) {
    row = await prisma.meetingSettings.create({
      data: { ...defaultSettings, ...data },
    });
  } else {
    row = await prisma.meetingSettings.update({
      where: { id: row.id },
      data,
    });
  }
  return row;
}

export async function getAvailableSlots({ date, duration }) {
  const settings = await ensureMeetingSettings();
  if (!settings.isActive) {
    return { date, duration, timezone: settings.timezone, slots: [] };
  }

  const durationMin = Number(duration) || settings.durations[0] || 30;
  if (!settings.durations.includes(durationMin)) {
    throw httpError(400, "Invalid meeting duration");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw httpError(400, "date must be YYYY-MM-DD");
  }

  const timezone = settings.timezone;
  const now = new Date();
  const todayKey = toDateKey(now, timezone);
  if (date < todayKey) {
    return { date, duration: durationMin, timezone, slots: [] };
  }

  const probe = zonedLocalToUtc(date, 12 * 60, timezone);
  const weekday = getZonedParts(probe, timezone).weekday;
  if (!settings.workDays.includes(weekday)) {
    return { date, duration: durationMin, timezone, slots: [] };
  }

  const windowEnd = new Date(now);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + settings.bookingWindowDays);
  const windowEndKey = toDateKey(windowEnd, timezone);
  if (date > windowEndKey) {
    return { date, duration: durationMin, timezone, slots: [] };
  }

  const dayStart = zonedLocalToUtc(date, 0, timezone);
  const dayEnd = zonedLocalToUtc(date, 24 * 60 - 1, timezone);

  const bookings = await prisma.meetingBooking.findMany({
    where: {
      status: "confirmed",
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
  });

  const slots = [];
  const interval = settings.slotIntervalMin || 30;
  const latestStart = settings.dayEndMinutes - durationMin;

  for (
    let mins = settings.dayStartMinutes;
    mins <= latestStart;
    mins += interval
  ) {
    const startAt = zonedLocalToUtc(date, mins, timezone);
    const endAt = new Date(startAt.getTime() + durationMin * 60 * 1000);

    if (startAt <= now) continue;

    const booked = bookings.some((booking) =>
      rangesOverlap(startAt, endAt, booking.startAt, booking.endAt),
    );

    slots.push({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      label: formatSlotLabel(mins, true),
      label24: formatSlotLabel(mins, false),
      minutes: mins,
      booked,
    });
  }

  return { date, duration: durationMin, timezone, slots };
}

export async function createMeetingBooking(body = {}) {
  const settings = await ensureMeetingSettings();
  if (!settings.isActive) {
    throw httpError(403, "Meeting booking is currently disabled");
  }

  const guestName = String(body.guestName || body.name || "").trim();
  const guestEmail = String(body.guestEmail || body.email || "").trim();
  const subject = body.subject ? String(body.subject).trim() : null;
  const notes = body.notes || body.body || body.message
    ? String(body.notes || body.body || body.message).trim()
    : null;
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const durationMin = Number(body.durationMin || body.duration);

  if (!guestName || !guestEmail || !startAt || Number.isNaN(startAt.getTime())) {
    throw httpError(400, "guestName, guestEmail, and startAt are required");
  }
  if (!settings.durations.includes(durationMin)) {
    throw httpError(400, "Invalid meeting duration");
  }
  if (startAt <= new Date()) {
    throw httpError(400, "Cannot book a past time slot");
  }

  const endAt = new Date(startAt.getTime() + durationMin * 60 * 1000);
  const dateKey = toDateKey(startAt, settings.timezone);
  const availability = await getAvailableSlots({
    date: dateKey,
    duration: durationMin,
  });
  const stillOpen = availability.slots.some(
    (slot) => slot.startAt === startAt.toISOString() && !slot.booked,
  );
  if (!stillOpen) {
    throw httpError(409, "That time slot is no longer available");
  }

  let meetUrl = resolveConfiguredMeetUrl(settings);
  try {
    const meetEvent = await createGoogleMeetEvent({
      summary: subject || `${settings.title} with ${settings.hostName}`,
      description: [
        notes || "",
        guestName ? `Guest: ${guestName}` : "",
        guestEmail ? `Email: ${guestEmail}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      startAt,
      endAt,
      timeZone: settings.timezone,
      guestEmail,
      guestName,
    });
    if (meetEvent?.meetUrl) meetUrl = meetEvent.meetUrl;
  } catch (err) {
    console.warn("[meet] Could not create Google Meet event.", err.message);
  }

  const booking = await prisma.meetingBooking.create({
    data: {
      guestName,
      guestEmail,
      subject,
      notes,
      startAt,
      endAt,
      durationMin,
      timezone: settings.timezone,
      locationLabel: settings.locationLabel,
      meetUrl,
      status: "confirmed",
    },
  });

  const mailResult = await sendMeetingNotification(booking, settings);
  return { booking, email: mailResult };
}

export async function listMeetingBookings() {
  return prisma.meetingBooking.findMany({
    orderBy: { startAt: "desc" },
  });
}

export async function getMeetingAnalytics() {
  const now = new Date();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [total, confirmed, cancelled, upcoming, past, thisWeek, thisMonth, recent] =
    await Promise.all([
      prisma.meetingBooking.count(),
      prisma.meetingBooking.count({ where: { status: "confirmed" } }),
      prisma.meetingBooking.count({ where: { status: "cancelled" } }),
      prisma.meetingBooking.count({
        where: { status: "confirmed", startAt: { gte: now } },
      }),
      prisma.meetingBooking.count({
        where: { status: "confirmed", startAt: { lt: now } },
      }),
      prisma.meetingBooking.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.meetingBooking.count({
        where: { createdAt: { gte: monthAgo } },
      }),
      prisma.meetingBooking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          guestName: true,
          guestEmail: true,
          startAt: true,
          durationMin: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    total,
    confirmed,
    cancelled,
    upcoming,
    past,
    thisWeek,
    thisMonth,
    recent,
  };
}

export async function cancelMeetingBooking(id) {
  const booking = await prisma.meetingBooking.findUnique({ where: { id } });
  if (!booking) throw httpError(404, "Booking not found");

  return prisma.meetingBooking.update({
    where: { id },
    data: { status: "cancelled" },
  });
}

export async function deleteMeetingBooking(id) {
  const booking = await prisma.meetingBooking.findUnique({ where: { id } });
  if (!booking) throw httpError(404, "Booking not found");
  await prisma.meetingBooking.delete({ where: { id } });
  return { ok: true };
}
