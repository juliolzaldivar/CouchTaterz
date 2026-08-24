/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TvShow } from '../types';

export interface CalendarEventInfo {
  showTitle: string;
  season: number;
  episode: number;
  episodeTitle?: string;
  airDate: string; // YYYY-MM-DD
  streamingService: string;
  overview?: string;
}

function escapeIcsText(str: string = ''): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatIcsTimestamp(d: Date = new Date()): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a clean URL for adding an episode air date to Google Calendar.
 */
export function generateGoogleCalendarUrl(event: CalendarEventInfo): string {
  const cleanDate = event.airDate.replace(/-/g, '');
  // Calculate next day for all-day end date
  const parts = event.airDate.split('-');
  let nextDayStr = cleanDate;
  if (parts.length === 3) {
    const nextDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + 1);
    const ny = nextDate.getFullYear();
    const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nd = String(nextDate.getDate()).padStart(2, '0');
    nextDayStr = `${ny}${nm}${nd}`;
  }

  const epLabel = event.episodeTitle && !event.episodeTitle.toLowerCase().startsWith('episode')
    ? ` - "${event.episodeTitle}"`
    : '';
  const title = `[CouchTaterz] ${event.showTitle} S${event.season}E${event.episode}${epLabel}`;

  const detailsLines = [
    `New episode of ${event.showTitle} scheduled to air on ${event.streamingService}.`,
    '',
    `Show: ${event.showTitle}`,
    `Episode: Season ${event.season}, Episode ${event.episode}${event.episodeTitle ? ` ("${event.episodeTitle}")` : ''}`,
    `Streaming Platform: ${event.streamingService}`,
    event.overview ? `\nOverview: ${event.overview}` : '',
    '',
    'Tracked via CouchTaterz TV Tracker'
  ].filter(Boolean);

  const details = detailsLines.join('\n');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${cleanDate}/${nextDayStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.streamingService)}`;
}

/**
 * Generates a clean web link for adding an episode air date to Microsoft Outlook / Office 365.
 */
export function generateOutlookCalendarUrl(event: CalendarEventInfo): string {
  const epLabel = event.episodeTitle && !event.episodeTitle.toLowerCase().startsWith('episode')
    ? ` - "${event.episodeTitle}"`
    : '';
  const title = `[CouchTaterz] ${event.showTitle} S${event.season}E${event.episode}${epLabel}`;

  const detailsLines = [
    `New episode of ${event.showTitle} scheduled to air on ${event.streamingService}.`,
    '',
    `Show: ${event.showTitle}`,
    `Episode: Season ${event.season}, Episode ${event.episode}${event.episodeTitle ? ` ("${event.episodeTitle}")` : ''}`,
    `Streaming Platform: ${event.streamingService}`,
    event.overview ? `\nOverview: ${event.overview}` : '',
    '',
    'Tracked via CouchTaterz TV Tracker'
  ].filter(Boolean);

  const details = detailsLines.join('\n');

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(details)}&startdt=${event.airDate}&enddt=${event.airDate}&allday=true&location=${encodeURIComponent(event.streamingService)}`;
}

/**
 * Generates standard .ics (iCalendar) text for one or multiple events (compatible with Apple Calendar, iOS, Outlook, etc.).
 */
export function generateIcsContent(events: CalendarEventInfo[]): string {
  const nowStamp = formatIcsTimestamp(new Date());

  const vevents = events.map((ev, idx) => {
    const cleanDate = ev.airDate.replace(/-/g, '');
    const parts = ev.airDate.split('-');
    let nextDayStr = cleanDate;
    if (parts.length === 3) {
      const nextDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + 1);
      const ny = nextDate.getFullYear();
      const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDate.getDate()).padStart(2, '0');
      nextDayStr = `${ny}${nm}${nd}`;
    }

    const epLabel = ev.episodeTitle && !ev.episodeTitle.toLowerCase().startsWith('episode')
      ? ` - "${ev.episodeTitle}"`
      : '';
    const summary = `[CouchTaterz] ${ev.showTitle} S${ev.season}E${ev.episode}${epLabel}`;
    
    const descLines = [
      `New episode of ${ev.showTitle} airing on ${ev.streamingService}.`,
      `Season ${ev.season}, Episode ${ev.episode}${ev.episodeTitle ? ` - ${ev.episodeTitle}` : ''}`,
      ev.overview ? `Synopsis: ${ev.overview}` : '',
      'Tracked with CouchTaterz'
    ].filter(Boolean);

    const uid = `couchtaterz-${ev.showTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}-s${ev.season}e${ev.episode}-${cleanDate}-${idx}@couchtaterz.app`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${nextDayStr}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(descLines.join('\n'))}`,
      `LOCATION:${escapeIcsText(ev.streamingService)}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CouchTaterz//TV Release Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:CouchTaterz TV Releases',
    'X-WR-TIMEZONE:UTC',
    ...vevents,
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers browser download of an .ics file
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Extracts a CalendarEventInfo object from a TvShow with nextEpisode
 */
export function extractCalendarEvent(show: TvShow): CalendarEventInfo | null {
  if (!show.nextEpisode || !show.nextEpisode.airDate || show.concluded) return null;
  return {
    showTitle: show.title,
    season: show.nextEpisode.season,
    episode: show.nextEpisode.episode,
    episodeTitle: show.nextEpisode.title,
    airDate: show.nextEpisode.airDate.split('T')[0],
    streamingService: show.streamingService,
    overview: show.nextEpisode.overview
  };
}

/**
 * Formats a relative human-readable label for an air date string (e.g. "Today", "Tomorrow", "In 3 days", "Sunday, Sep 20")
 */
export function formatRelativeAirDate(airDateStr: string): { label: string; isPast: boolean; isToday: boolean; isSoon: boolean } {
  if (!airDateStr) return { label: 'TBD', isPast: false, isToday: false, isSoon: false };

  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const parts = airDateStr.split('-');
  if (parts.length !== 3) {
    return { label: airDateStr, isPast: false, isToday: false, isSoon: false };
  }

  const targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const targetZero = targetDate.getTime();

  const diffDays = Math.round((targetZero - todayZero) / (1000 * 60 * 60 * 24));

  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = targetDate.getDate();

  if (diffDays === 0) {
    return { label: 'Airing Today', isPast: false, isToday: true, isSoon: true };
  }
  if (diffDays === 1) {
    return { label: 'Tomorrow', isPast: false, isToday: false, isSoon: true };
  }
  if (diffDays > 1 && diffDays <= 6) {
    return { label: `In ${diffDays} days (${dayOfWeek})`, isPast: false, isToday: false, isSoon: true };
  }
  if (diffDays === -1) {
    return { label: 'Aired Yesterday', isPast: true, isToday: false, isSoon: false };
  }
  if (diffDays < -1) {
    return { label: `Aired ${monthName} ${dayNum}`, isPast: true, isToday: false, isSoon: false };
  }

  return { label: `${dayOfWeek}, ${monthName} ${dayNum}`, isPast: false, isToday: false, isSoon: diffDays <= 14 };
}
