import { Reminder, ScheduleType, IntervalSchedule, SpecificTimesSchedule, WeeklySchedule, PRNSchedule, PRNDoseLog } from '../types';

/**
 * Parses any time string ("08:00 AM", "8:30 PM", "14:00", "09:15") into total minutes from midnight (0..1439).
 */
export function parseToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const numbersOnly = clean.replace(/[^\d:]/g, '');
  const parts = numbersOnly.split(':');
  let hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return (hours * 60 + minutes) % 1440;
}

/**
 * Formats total minutes from midnight (0..1439) to "hh:mm AM/PM"
 */
export function minutesToAmPm(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;

  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;

  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Formats minutes to 24-hour "HH:mm" for HTML <input type="time">
 */
export function minutesTo24h(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculates interval-based cycle times for a single day.
 * - Continuous 24-hour mode: calculates all repeating times separated by intervalHours across 24h starting at anchorTime.
 * - Waking-hour mode: only includes times falling within wakingStart and wakingEnd (inclusive).
 */
export function calculateIntervalTimes(
  anchorTime: string = '08:00 AM',
  intervalHours: number = 4,
  mode: 'continuous_24h' | 'waking_hours' = 'continuous_24h',
  wakingStart: string = '07:00 AM',
  wakingEnd: string = '09:00 PM'
): string[] {
  const stepMinutes = Math.max(30, Math.round((intervalHours || 4) * 60));
  const anchorMin = parseToMinutes(anchorTime);
  const wakingStartMin = parseToMinutes(wakingStart || '07:00 AM');
  const wakingEndMin = parseToMinutes(wakingEnd || '09:00 PM');

  const timesInMinutes: number[] = [];

  if (mode === 'continuous_24h') {
    const totalSlots = Math.floor(1440 / stepMinutes);
    for (let i = 0; i < totalSlots; i++) {
      const slotMin = (anchorMin + i * stepMinutes) % 1440;
      timesInMinutes.push(slotMin);
    }
  } else {
    // Waking hours limits
    // Start at wakingStart or anchorTime if within waking window
    let current = wakingStartMin;
    // If anchor is inside waking window, start at anchor or align to anchor
    if (anchorMin >= wakingStartMin && anchorMin <= wakingEndMin) {
      // align back to earliest within waking window
      current = anchorMin;
      while (current - stepMinutes >= wakingStartMin) {
        current -= stepMinutes;
      }
    }

    while (current <= wakingEndMin) {
      timesInMinutes.push(current);
      current += stepMinutes;
    }
  }

  // Remove duplicates and sort chronologically from 00:00 to 23:59
  const uniqueSorted = Array.from(new Set(timesInMinutes)).sort((a, b) => a - b);
  return uniqueSorted.map(minutesToAmPm);
}

/**
 * Returns all calculated daily scheduled times for any reminder for a specific date.
 */
export function getDailyTimesForReminder(reminder: Reminder, date: Date = new Date()): string[] {
  if (!reminder) return [];

  const type = reminder.scheduleType || (reminder.interval ? 'interval' : 'specific_times');

  switch (type) {
    case 'interval': {
      const config = reminder.intervalConfig || {
        intervalHours: reminder.interval || 4,
        anchorTime: reminder.time || '08:00 AM',
        mode: 'continuous_24h'
      };
      return calculateIntervalTimes(
        config.anchorTime,
        config.intervalHours,
        config.mode,
        config.wakingStart,
        config.wakingEnd
      );
    }

    case 'specific_times': {
      if (reminder.specificTimesConfig?.times && reminder.specificTimesConfig.times.length > 0) {
        return [...reminder.specificTimesConfig.times].sort(
          (a, b) => parseToMinutes(a) - parseToMinutes(b)
        );
      }
      return reminder.time ? [reminder.time] : ['08:00 AM'];
    }

    case 'weekly': {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
      const activeDays = reminder.weeklyConfig?.days || [1, 3, 5]; // default Mon/Wed/Fri
      if (!activeDays.includes(dayOfWeek)) {
        return [];
      }
      const times = reminder.weeklyConfig?.times || (reminder.time ? [reminder.time] : ['08:00 AM']);
      return [...times].sort((a, b) => parseToMinutes(a) - parseToMinutes(b));
    }

    case 'prn':
      // PRN is on-demand, no pre-fixed daily times
      return [];

    default:
      return reminder.time ? [reminder.time] : [];
  }
}

/**
 * Formats a duration in milliseconds to a clean countdown string "02h 45m 12s"
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00h 00m 00s';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Checks safety status for an As-Needed (PRN) medication / reminder.
 * Evaluates:
 * 1. Minimum interval between consecutive doses (e.g. at least 4 hours)
 * 2. Maximum doses within rolling 24-hour window (e.g. max 4 doses)
 */
export function evaluatePRNSafety(
  prnConfig?: PRNSchedule,
  now: Date = new Date()
): {
  isSafe: boolean;
  lockReason?: 'min_interval' | 'max_doses';
  remainingMs: number;
  remainingFormatted: string;
  dosesInLast24h: number;
  maxDoses: number;
  minIntervalHours: number;
  nextSafeTime: Date | null;
  percentRemaining: number;
  lastLog: PRNDoseLog | null;
  recentLogs: PRNDoseLog[];
} {
  const minIntervalHours = prnConfig?.minIntervalHours ?? 4;
  const maxDoses = prnConfig?.maxDosesPer24h ?? 4;
  const logs = prnConfig?.doseLogs || [];

  const nowMs = now.getTime();
  const twentyFourHoursAgoMs = nowMs - 24 * 60 * 60 * 1000;
  const minIntervalMs = minIntervalHours * 60 * 60 * 1000;

  // Filter logs within the rolling 24-hour window
  const recentLogs = logs
    .filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= twentyFourHoursAgoMs;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const lastLog = logs.length > 0
    ? [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const dosesInLast24h = recentLogs.length;

  let isSafe = true;
  let remainingMs = 0;
  let lockReason: 'min_interval' | 'max_doses' | undefined = undefined;
  let nextSafeTime: Date | null = null;

  // Check 1: Minimum interval from last taken dose
  if (lastLog) {
    const lastTakenMs = new Date(lastLog.timestamp).getTime();
    const intervalElapsed = nowMs - lastTakenMs;
    if (intervalElapsed < minIntervalMs) {
      const remainingForInterval = minIntervalMs - intervalElapsed;
      if (remainingForInterval > remainingMs) {
        remainingMs = remainingForInterval;
        lockReason = 'min_interval';
        nextSafeTime = new Date(lastTakenMs + minIntervalMs);
        isSafe = false;
      }
    }
  }

  // Check 2: Maximum doses per 24 hours
  if (dosesInLast24h >= maxDoses && recentLogs.length > 0) {
    // Safe when the oldest dose in the 24h window falls out
    const oldestIn24h = recentLogs[recentLogs.length - 1];
    const oldestMs = new Date(oldestIn24h.timestamp).getTime();
    const unlockTimeMs = oldestMs + 24 * 60 * 60 * 1000;
    const remainingForMaxDoses = unlockTimeMs - nowMs;

    if (remainingForMaxDoses > remainingMs) {
      remainingMs = remainingForMaxDoses;
      lockReason = 'max_doses';
      nextSafeTime = new Date(unlockTimeMs);
      isSafe = false;
    }
  }

  const percentRemaining = !isSafe && minIntervalMs > 0
    ? Math.min(100, Math.max(0, (remainingMs / minIntervalMs) * 100))
    : 0;

  return {
    isSafe,
    lockReason,
    remainingMs: Math.max(0, remainingMs),
    remainingFormatted: formatCountdown(remainingMs),
    dosesInLast24h,
    maxDoses,
    minIntervalHours,
    nextSafeTime,
    percentRemaining,
    lastLog,
    recentLogs
  };
}

/**
 * Calculates the next upcoming scheduled dose time for a reminder.
 */
export function getNextUpcomingDose(
  reminder: Reminder,
  now: Date = new Date()
): {
  timeStr: string;
  targetDate: Date;
  diffMinutes: number;
  isToday: boolean;
  label: string;
} | null {
  const isReminderActive = reminder.active !== false && reminder.isActive !== false;
  if (!isReminderActive) return null;

  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  if (reminder.scheduleType === 'prn') {
    const safety = evaluatePRNSafety(reminder.prnConfig, now);
    if (safety.isSafe) {
      return {
        timeStr: 'As Needed',
        targetDate: now,
        diffMinutes: 0,
        isToday: true,
        label: 'Ready to take now'
      };
    }
    if (safety.nextSafeTime) {
      const diffMs = safety.nextSafeTime.getTime() - now.getTime();
      const diffMin = Math.ceil(diffMs / 60000);
      return {
        timeStr: minutesToAmPm(safety.nextSafeTime.getHours() * 60 + safety.nextSafeTime.getMinutes()),
        targetDate: safety.nextSafeTime,
        diffMinutes: diffMin,
        isToday: safety.nextSafeTime.toDateString() === now.toDateString(),
        label: `Safe in ${formatCountdown(diffMs)}`
      };
    }
    return null;
  }

  // Check today's times
  const todayTimes = getDailyTimesForReminder(reminder, now);
  for (const timeStr of todayTimes) {
    const tMin = parseToMinutes(timeStr);
    if (tMin >= currentMinutesToday) {
      const diffMin = tMin - currentMinutesToday;
      const targetDate = new Date(now);
      targetDate.setHours(Math.floor(tMin / 60), tMin % 60, 0, 0);

      const label = diffMin === 0 ? 'Due right now' : diffMin < 60 ? `Due in ${diffMin}m` : `Due in ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;

      return {
        timeStr,
        targetDate,
        diffMinutes: diffMin,
        isToday: true,
        label
      };
    }
  }

  // Look ahead into upcoming days (up to 7 days)
  for (let offset = 1; offset <= 7; offset++) {
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + offset);
    const futureTimes = getDailyTimesForReminder(reminder, futureDate);

    if (futureTimes.length > 0) {
      const firstTimeStr = futureTimes[0];
      const tMin = parseToMinutes(firstTimeStr);
      futureDate.setHours(Math.floor(tMin / 60), tMin % 60, 0, 0);

      const diffMs = futureDate.getTime() - now.getTime();
      const diffMin = Math.ceil(diffMs / 60000);
      const weekdayName = futureDate.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        timeStr: firstTimeStr,
        targetDate: futureDate,
        diffMinutes: diffMin,
        isToday: false,
        label: offset === 1 ? `Tomorrow at ${firstTimeStr}` : `${weekdayName} at ${firstTimeStr}`
      };
    }
  }

  return null;
}

/**
 * Evaluates which active reminders should trigger an alarm right at the current minute.
 */
export function getDueRemindersNow(
  reminders: Reminder[],
  now: Date = new Date()
): {
  reminder: Reminder;
  triggerTime: string;
  title: string;
  body: string;
  tag: string;
}[] {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentMinuteTotal = currentHours * 60 + currentMinutes;
  const currentTimeStr = minutesToAmPm(currentMinuteTotal);

  const dueList: {
    reminder: Reminder;
    triggerTime: string;
    title: string;
    body: string;
    tag: string;
  }[] = [];

  for (const r of reminders) {
    const isActive = r.active !== false && r.isActive !== false;
    if (!isActive) continue;
    if (r.scheduleType === 'prn') continue; // PRN doesn't auto-alarm by fixed clock

    const dailyTimes = getDailyTimesForReminder(r, now);
    const matchesNow = dailyTimes.some(t => parseToMinutes(t) === currentMinuteTotal);

    if (matchesNow) {
      const categoryLabel = r.category ? r.category.toUpperCase() : (r.type || 'REMINDER').toUpperCase();
      const dosageText = r.dosage ? ` (${r.dosage})` : '';
      dueList.push({
        reminder: r,
        triggerTime: currentTimeStr,
        title: `⏰ ${r.title}${dosageText}`,
        body: `Scheduled ${categoryLabel} is due at ${currentTimeStr}. Tap to log dose or snooze.`,
        tag: `rem_${r.id}_${now.toISOString().split('T')[0]}_${currentMinuteTotal}`
      });
    }
  }

  return dueList;
}

/**
 * Web Audio API gentle synthesized chime.
 * Triggers a rich melodic multi-tone chime without any external audio asset dependencies.
 */
export function playSynthesizedChime(type: 'gentle' | 'alert' | 'success' = 'gentle'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'success') {
      // Upbeat 3-note arpeggio (C5 -> E5 -> G5)
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } else if (type === 'alert') {
      // 2-tone alert chime (A5 -> C#6)
      const frequencies = [880.0, 1108.73];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.65);
      });
    } else {
      // Gentle harmonious chime (E5 -> G#5 -> B5)
      const notes = [
        { freq: 659.25, time: 0 },
        { freq: 830.61, time: 0.15 },
        { freq: 987.77, time: 0.3 }
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.2, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + 0.75);
      });
    }
  } catch (err) {
    console.warn('Audio chime playback omitted:', err);
  }
}
