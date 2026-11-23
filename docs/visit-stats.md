# Visit counter: server setup

The footer shows a small line such as "12,340 page views · 3,100 visits since
Nov 2026". It reads `/stats.json` from the site itself. That file is made on
the server from the web server's own access logs by
[`scripts/visit-stats.mjs`](../scripts/visit-stats.mjs). There is no tracking
script, no cookie, no database, and no third-party service.

Until `/stats.json` exists, the footer line stays hidden, so the site works
the same with or without this setup (for example in `npm run dev`).

## What is counted

- **Page view:** a successful `GET` for an HTML page (a path ending in `/` or
  `.html`). Assets (`/_astro/`, `/pagefind/`, images, `stats.json`), failed
  requests, and bots (by user agent) are skipped.
- **Visit:** one browser on one day, told apart by address + user agent. That
  pair is hashed in memory only, to count distinct values, and is never
  written to disk.
- Only **per-day totals** are saved (`state.json`), so counts survive log
  rotation. The public `stats.json` holds just the totals and the first day.

The Privacy page (`/privacy/#visit-counter`) explains this to visitors. Keep
it in sync if the counting rules change.

## Assumptions

- nginx (or Apache) writing access logs in the default **combined** format,
  for example `/var/log/nginx/access.log`, rotated to `access.log.1`,
  `access.log.2.gz`, and so on.
- Node.js 22 or newer on the server (no npm packages needed).
- The site's files are deployed from `dist/`. Because a deploy replaces that
  folder, `stats.json` lives **outside** it and nginx serves it from there.

## Setup (about 10 minutes)

1. Copy the two script files to the server, for example:

   ```bash
   sudo mkdir -p /opt/start-stats /var/lib/start-stats
   sudo cp scripts/visit-stats.mjs scripts/visit-stats-lib.mjs /opt/start-stats/
   ```

2. Run it once by hand to check it reads your logs. It needs read access to
   the logs (on Debian and Ubuntu, the `adm` group has it):

   ```bash
   sudo node /opt/start-stats/visit-stats.mjs \
     --state /var/lib/start-stats/state.json \
     --out /var/lib/start-stats/stats.json \
     /var/log/nginx/access.log*
   ```

   It prints a one-line summary, such as
   `visit-stats: 240 page views, 61 visits since 2026-11-20`.

3. Serve the file at `/stats.json`. In the site's nginx `server { }` block:

   ```nginx
   location = /stats.json {
       alias /var/lib/start-stats/stats.json;
       default_type application/json;
       add_header Cache-Control "public, max-age=300";
   }
   ```

   Then `sudo nginx -t && sudo systemctl reload nginx`, and check that
   `https://<your-domain>/stats.json` returns the totals.

4. Refresh it every hour with cron (`sudo crontab -e`):

   ```cron
   5 * * * * node /opt/start-stats/visit-stats.mjs --state /var/lib/start-stats/state.json --out /var/lib/start-stats/stats.json /var/log/nginx/access.log* >/dev/null 2>&1
   ```

## Notes

- **Counting starts from the logs you have.** If logrotate keeps 14 days,
  the counter starts 14 days back. Older history is not recovered.
- **Behind a CDN or proxy** (such as Cloudflare), the log address may be the
  proxy's, which makes visits too low. Configure nginx's `real_ip` module so
  the log records the visitor's address.
- **Resetting:** delete `state.json` and `stats.json`; the next run starts
  again from the current logs.
- **Turning it off:** remove the cron line and the nginx `location`. The
  footer line hides itself when `/stats.json` is gone.
