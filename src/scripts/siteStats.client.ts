// The small visit counter in the footer. It reads /stats.json, a file the
// server writes from its own access logs (scripts/visit-stats.mjs), and
// shows "12,340 page views · 3,100 visits since Nov 2026". No tracking code
// runs here: this only reads a public file from the same site.
//
// If the file is missing (local development, or before the server job has
// run), or looks wrong, the counter simply stays hidden.

export interface SiteStats {
  views: number;
  visits: number;
  since: string | null;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** The footer line for a stats file, or null when it should stay hidden. */
export function formatStats(data: unknown): string | null {
  const stats = data as Partial<SiteStats> | null;
  if (!stats || !isCount(stats.views) || !isCount(stats.visits) || stats.views === 0) return null;
  const n = new Intl.NumberFormat('en-US');
  const views = `${n.format(stats.views)} page ${stats.views === 1 ? 'view' : 'views'}`;
  const visits = `${n.format(stats.visits)} ${stats.visits === 1 ? 'visit' : 'visits'}`;
  let since = '';
  if (typeof stats.since === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stats.since)) {
    const date = new Date(`${stats.since}T00:00:00Z`);
    since = ` since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`;
  }
  return `${views} · ${visits}${since}`;
}

export async function renderSiteStats(
  element: HTMLElement,
  load: () => Promise<unknown> = async () => {
    const response = await fetch('/stats.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  },
): Promise<void> {
  try {
    const text = formatStats(await load());
    if (!text) return;
    const target = element.querySelector<HTMLElement>('[data-site-stats-text]') ?? element;
    target.textContent = text;
    element.hidden = false;
  } catch {
    // No stats file yet: keep the counter hidden.
  }
}
