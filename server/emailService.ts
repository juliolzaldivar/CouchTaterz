import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailReminderPayload {
  to: string;
  userName?: string;
  showTitle: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  airDate?: string;
  streamingService?: string;
  bannerImage?: string;
  rottenTomatoesScore?: number | null;
  userScore?: number | null;
  overview?: string;
  appUrl?: string;
}

export interface SendResult {
  success: boolean;
  provider: 'smtp' | 'resend' | 'ethereal' | 'simulated';
  message: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

const REMINDER_LOGS_FILE = path.join(process.cwd(), 'data', 'reminder_logs.json');

// Ensure data folder exists
function ensureLogDir() {
  const dir = path.dirname(REMINDER_LOGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export interface ReminderLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  showId: string;
  showTitle: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  airDate: string;
  sentAt: string;
  provider: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
}

export function readReminderLogs(): Record<string, ReminderLogEntry> {
  try {
    ensureLogDir();
    if (!fs.existsSync(REMINDER_LOGS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(REMINDER_LOGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function saveReminderLog(entry: ReminderLogEntry) {
  try {
    ensureLogDir();
    const logs = readReminderLogs();
    logs[entry.id] = entry;
    fs.writeFileSync(REMINDER_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    console.error('[Reminder Logs] Failed to write log entry:', e);
  }
}

// Check if an email provider is configured
export function getEmailProviderConfig() {
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPortRaw = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
  const smtpPort = (!isNaN(smtpPortRaw) && smtpPortRaw >= 1 && smtpPortRaw <= 65535) ? smtpPortRaw : 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();

  const isValidResendKey = resendKey.startsWith('re_') && resendKey.length >= 15 && !resendKey.includes('placeholder') && !resendKey.includes('your_');
  const isValidSmtpHost = smtpHost.length >= 3 && !/^\d+$/.test(smtpHost) && (smtpHost.includes('.') || smtpHost === 'localhost') && !smtpHost.includes('placeholder') && !smtpHost.includes('your_');

  if (isValidResendKey) {
    return { provider: 'resend', ready: true };
  }
  if (isValidSmtpHost && (smtpUser || smtpPass)) {
    return { provider: 'smtp', ready: true, host: smtpHost, port: smtpPort };
  }
  return { provider: 'simulated', ready: false };
}

// Generate the CouchTaterz responsive HTML email template
export function generateReminderEmailHtml(payload: EmailReminderPayload): string {
  const {
    userName = 'Tater Friend',
    showTitle,
    season = 1,
    episode = 1,
    episodeTitle = 'New Episode',
    airDate = 'Upcoming',
    streamingService = 'Streaming',
    bannerImage,
    rottenTomatoesScore,
    userScore,
    overview,
    appUrl = process.env.APP_URL || 'https://couchtaterz.com'
  } = payload;

  const fallbackBanner = 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&q=80';
  const displayImage = bannerImage || fallbackBanner;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CouchTaterz Air Date Reminder: ${showTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0c10;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #12151c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 24px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .banner-container {
      position: relative;
      width: 100%;
      height: 220px;
      background-color: #1e293b;
      overflow: hidden;
    }
    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, #12151c 0%, rgba(18, 21, 28, 0.4) 60%, transparent 100%);
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .show-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 14px 0;
      line-height: 1.2;
    }
    .badge-row {
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      margin-right: 8px;
      margin-bottom: 6px;
    }
    .badge-service {
      background-color: #3b82f6;
      color: #ffffff;
    }
    .badge-episode {
      background-color: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fcd34d;
    }
    .badge-score {
      background-color: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }
    .alert-box {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 14px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .alert-title {
      font-size: 14px;
      font-weight: 700;
      color: #fbbf24;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .alert-text {
      font-size: 13px;
      color: #fef3c7;
      margin: 0;
      line-height: 1.5;
    }
    .overview-box {
      background: #181c26;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .overview-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .overview-text {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0;
    }
    .cta-container {
      text-align: center;
      margin: 28px 0 10px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000000;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
      letter-spacing: 0.02em;
    }
    .footer {
      padding: 20px 30px;
      background-color: #0d0f15;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #94a3b8;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">
        🍿 CouchTaterz TV Alert
      </div>
    </div>

    ${bannerImage ? `
    <div class="banner-container">
      <img src="${displayImage}" alt="${showTitle}" class="banner-img" />
      <div class="banner-overlay"></div>
    </div>
    ` : ''}

    <div class="content">
      <div class="greeting">Hey ${userName},</div>
      <h1 class="show-title">${showTitle}</h1>

      <div class="badge-row">
        <span class="badge badge-service">📺 ${streamingService}</span>
        <span class="badge badge-episode">S${season} • E${episode}: ${episodeTitle}</span>
        ${rottenTomatoesScore ? `<span class="badge badge-score">🍅 ${rottenTomatoesScore}% RT</span>` : ''}
        ${userScore ? `<span class="badge badge-episode">⭐ Your Score: ${userScore}/10</span>` : ''}
      </div>

      <div class="alert-box">
        <div class="alert-title">🔔 Air Date Alert!</div>
        <div class="alert-text">
          <strong>Season ${season}, Episode ${episode} ("${episodeTitle}")</strong> is scheduled to air on <strong>${airDate}</strong> on <strong>${streamingService}</strong>!
        </div>
      </div>

      ${overview ? `
      <div class="overview-box">
        <div class="overview-label">Episode Synopsis</div>
        <p class="overview-text">${overview}</p>
      </div>
      ` : ''}

      <div class="cta-container">
        <a href="${appUrl}" class="cta-button" target="_blank">
          Open CouchTaterz & Track Episode 🍿
        </a>
      </div>
    </div>

    <div class="footer">
      Sent with ❤️ by CouchTaterz • Your ultimate TV watchlist & binge companion.<br>
      You received this because you enabled TV air date alerts on your CouchTaterz board.<br>
      Manage your notification settings anytime in <a href="${appUrl}">CouchTaterz Preferences</a>.
    </div>
  </div>
</body>
</html>`;
}

// Send an air date reminder email
export async function sendAirDateReminderEmail(payload: EmailReminderPayload): Promise<SendResult> {
  const { to, showTitle, season = 1, episode = 1, episodeTitle = 'New Episode', airDate = 'Soon', streamingService = 'TV' } = payload;

  if (!to || !to.includes('@')) {
    return {
      success: false,
      provider: 'simulated',
      message: 'Invalid email address provided',
      error: 'Invalid recipient email'
    };
  }

  const subject = `🍿 Air Date Alert: "${showTitle}" (S${season}E${episode}) airs ${airDate}!`;
  const htmlContent = generateReminderEmailHtml(payload);
  const textContent = `CouchTaterz Air Date Alert!\n\nHey ${payload.userName || 'Tater Friend'},\n\n"${showTitle}" Season ${season}, Episode ${episode} ("${episodeTitle}") is scheduled to air on ${airDate} on ${streamingService}!\n\nOpen CouchTaterz to update your watch status: ${payload.appUrl || 'https://couchtaterz.com'}\n\n- The CouchTaterz Team`;

  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPortRaw = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
  const smtpPort = (!isNaN(smtpPortRaw) && smtpPortRaw >= 1 && smtpPortRaw <= 65535) ? smtpPortRaw : 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFrom = process.env.SMTP_FROM || '"CouchTaterz TV Alert" <notifications@couchtaterz.com>';
  const resendKey = (process.env.RESEND_API_KEY || '').trim();

  const isLikelyResendKey = resendKey.startsWith('re_') && resendKey.length >= 15 && !resendKey.includes('placeholder') && !resendKey.includes('your_');
  const isLikelySmtpHost = smtpHost.length >= 3 && !/^\d+$/.test(smtpHost) && (smtpHost.includes('.') || smtpHost === 'localhost') && !smtpHost.includes('placeholder') && !smtpHost.includes('your_');

  // 1. Try Resend API if valid API key is present
  if (isLikelyResendKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: smtpFrom.includes('<') ? smtpFrom.match(/<([^>]+)>/)?.[1] || smtpFrom : smtpFrom,
          to: [to],
          subject,
          html: htmlContent,
          text: textContent
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          provider: 'resend',
          message: `Email reminder successfully dispatched via Resend to ${to}!`,
          messageId: data.id
        };
      } else {
        const errText = await res.text().catch(() => '');
        console.warn('[Email Reminder] Resend delivery response returned non-ok status:', res.status, errText);
      }
    } catch (err: any) {
      console.warn('[Email Reminder] Resend attempt failed (will fallback):', err?.message || err);
    }
  }

  // 2. Try SMTP if valid host is present
  if (isLikelySmtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
        auth: (smtpUser && smtpPass) ? {
          user: smtpUser,
          pass: smtpPass
        } : undefined,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      return {
        success: true,
        provider: 'smtp',
        message: `Email reminder successfully dispatched via SMTP to ${to}!`,
        messageId: info.messageId
      };
    } catch (err: any) {
      console.warn('[Email Reminder] SMTP delivery failed (will fallback):', err?.message || err);
    }
  }

  // 3. Fallback: Log full formatted email and simulate delivery
  console.log(`[Email Reminder] (Simulated Delivery) Reminder generated for ${to}: "${showTitle}" (S${season}E${episode} on ${airDate})`);
  return {
    success: true,
    provider: 'simulated',
    message: `Reminder successfully queued & simulated for ${to}. To deliver via live SMTP or Resend, configure valid SMTP_HOST/SMTP_USER or RESEND_API_KEY credentials.`,
    messageId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  };
}

// Check and dispatch all due reminders across all boards
export async function checkAndDispatchDueReminders(
  db: Record<string, any>,
  saveBoardFn?: (db: Record<string, any>, boardId: string) => Promise<void> | void
): Promise<{
  checkedBoards: number;
  checkedShows: number;
  remindersSent: number;
  details: Array<{ user: string; email: string; show: string; episode: string; airDate: string; provider: string }>;
}> {
  const logs = readReminderLogs();
  const today = new Date();
  const details: Array<{ user: string; email: string; show: string; episode: string; airDate: string; provider: string }> = [];
  let checkedBoards = 0;
  let checkedShows = 0;
  let remindersSent = 0;

  for (const [boardId, board] of Object.entries(db)) {
    if (!board || !Array.isArray(board.shows)) continue;
    checkedBoards++;

    // Resolve user email
    let userEmail = board.owner?.email || board.preferences?.alertDestination;
    if (boardId === 'default' || boardId === 'user-julio') {
      userEmail = userEmail || 'juliozaldivar@gmail.com';
    }
    const userName = board.owner?.name || board.name || 'Tater Friend';

    if (!userEmail || !userEmail.includes('@')) {
      continue;
    }

    for (const show of board.shows) {
      checkedShows++;
      if (!show || !show.hasAirDateReminder || !show.nextEpisode || !show.nextEpisode.airDate) {
        continue;
      }

      const nextEp = show.nextEpisode;
      const airDateStr = nextEp.airDate; // e.g. "2026-08-21"
      const airDate = new Date(airDateStr);

      if (isNaN(airDate.getTime())) continue;

      // Calculate days difference (ignoring time-of-day for calendar dates)
      const diffMs = airDate.getTime() - today.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Trigger if air date is within next 48 hours, or is today, or up to 12 hours ago
      const isDue = diffDays >= -0.5 && diffDays <= 2.0;

      if (!isDue) continue;

      const logKey = `${boardId}_${show.id || show.title}_S${nextEp.season || 1}E${nextEp.episode || 1}_${airDateStr}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      // Check if already dispatched for this specific episode air date
      if (logs[logKey] && logs[logKey].status === 'sent') {
        continue;
      }

      // Dispatch Email
      const result = await sendAirDateReminderEmail({
        to: userEmail,
        userName,
        showTitle: show.title,
        season: nextEp.season || 1,
        episode: nextEp.episode || 1,
        episodeTitle: nextEp.title || `Episode ${nextEp.episode || 1}`,
        airDate: airDateStr,
        streamingService: show.streamingService || 'Streaming',
        bannerImage: show.bannerImage,
        rottenTomatoesScore: show.rottenTomatoesScore,
        userScore: show.userScore,
        overview: nextEp.overview || show.overview,
        appUrl: process.env.APP_URL || 'https://couchtaterz.com'
      });

      // Dispatch In-App Notification to user's board
      if (!board.notifications) board.notifications = [];
      const notifId = `airdate-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const inAppMsg = `🔔 Air Date Alert: "${show.title}" (S${nextEp.season || 1}E${nextEp.episode || 1}) airs ${airDateStr} on ${show.streamingService || 'Streaming'}!`;
      
      // Avoid duplicate in-app notifications (match on show title/id or message)
      const hasExistingAlert = board.notifications.some((n: any) => {
        if (!n) return false;
        const matchesShow = (n.show?.title && n.show.title.toLowerCase() === show.title.toLowerCase()) || 
                            (n.show?.id && n.show.id === show.id);
        const matchesEpisode = n.message && n.message.includes(`S${nextEp.season}E${nextEp.episode}`);
        const isSystemAlert = n.senderId === 'system-alerts' || n.type === 'alert';
        return (matchesShow && (matchesEpisode || isSystemAlert)) || (n.message === inAppMsg);
      });

      if (!hasExistingAlert) {
        board.notifications.unshift({
          id: notifId,
          type: 'alert',
          senderName: 'CouchTaterz Alerts',
          senderAvatarUrl: '',
          senderId: 'system-alerts',
          message: inAppMsg,
          show,
          createdAt: new Date().toISOString()
        });
        board.updatedAt = new Date().toISOString();
        if (saveBoardFn) {
          try {
            await saveBoardFn(db, boardId);
          } catch (e) {
            console.error('[Reminder Notifications] Failed to persist board:', e);
          }
        }
      }

      // Record log entry
      saveReminderLog({
        id: logKey,
        userId: boardId,
        userEmail,
        showId: show.id || show.title,
        showTitle: show.title,
        season: nextEp.season,
        episode: nextEp.episode,
        episodeTitle: nextEp.title,
        airDate: airDateStr,
        sentAt: new Date().toISOString(),
        provider: result.provider,
        status: result.success ? 'sent' : 'failed',
        error: result.error
      });

      remindersSent++;
      details.push({
        user: userName,
        email: userEmail,
        show: show.title,
        episode: `S${nextEp.season || 1}E${nextEp.episode || 1}`,
        airDate: airDateStr,
        provider: result.provider
      });
    }
  }

  return {
    checkedBoards,
    checkedShows,
    remindersSent,
    details
  };
}
