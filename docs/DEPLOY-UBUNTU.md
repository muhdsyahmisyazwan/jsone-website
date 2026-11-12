# Deploy on Ubuntu VM (Nginx + Node)

The site is **static Astro output** (`web/dist`) plus a **Node API** (`server/`) for contact, preview, and Sanity rebuild webhooks.

This is the **production** install guide. Start from the checklist in [GO-LIVE.md](GO-LIVE.md). Product decisions: [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md).

## Architecture

```
Browser → Nginx :80/:443
            ├─ /*        → files in web/dist
            └─ /api/*    → Node on 127.0.0.1:4321
Sanity webhook → https://your-host/api/sanity-webhook
                 (header secret / signature) → rebuild.sh (flock + debounce)
```

## 1. Server packages

```bash
sudo apt update
sudo apt install -y nginx git curl
# Node 22 (example via NodeSource or nvm)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # >= 22.23
```

## 2. App user & clone

Use a dedicated **deploy user** (example `jsone`) that owns the tree. The systemd unit runs as that user with `NoNewPrivileges=true`, so rebuilds must not call `sudo`.

```bash
sudo adduser --system --group --home /var/www/jsone jsone
sudo mkdir -p /var/www/jsone /var/log/jsone
sudo chown jsone:jsone /var/www/jsone /var/log/jsone
sudo -u jsone git clone <your-repo-url> /var/www/jsone
cd /var/www/jsone
sudo -u jsone npm install
```

## 3. Environment

```bash
cp web/.env.example web/.env
nano web/.env
```

Minimum for a working site:

```env
PUBLIC_SITE_URL=https://jsone.com.my
PUBLIC_SANITY_PROJECT_ID=...
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...

# Contact (Turnstile still uses Cloudflare's CAPTCHA service - no Pages needed)
PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
# Local/dev only:
# TURNSTILE_SKIP=true
RESEND_API_KEY=...
CONTACT_TO_EMAIL=info@jsone.com.my

# Rebuild from Sanity (header auth — never put secret in the webhook URL)
SANITY_WEBHOOK_SECRET=long-random-string
REBUILD_COMMAND=/var/www/jsone/scripts/rebuild.sh
REBUILD_LOG_PATH=/var/log/jsone/rebuild.log
TRUST_PROXY=true
HOST=127.0.0.1

SANITY_PREVIEW_SECRET=another-long-random-string
SITE_ORIGIN=https://jsone.com.my
NODE_ENV=production
```

Also set Studio env (`studio/.env`) with the same project id and `SANITY_STUDIO_PREVIEW_ORIGIN=https://jsone.com.my`.

```bash
chmod 600 web/.env
chmod +x scripts/rebuild.sh
# optional: if Node must restart after API changes, install deploy/jsone-restart.example
# and set JSONE_RESTART_CMD=/usr/local/bin/jsone-restart (passwordless sudoers for systemctl only)
```

Edit `scripts/rebuild.sh` / `JSONE_ROOT` if the app path is not `/var/www/jsone`.

## 4. Build

```bash
cd /var/www/jsone
npm run build          # web/dist + server/dist
```

## 5. systemd (Node API)

```bash
sudo cp deploy/jsone-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now jsone-web
sudo systemctl status jsone-web
curl -s http://127.0.0.1:4321/api/health
```

## 6. Nginx

```bash
sudo cp deploy/nginx-jsone.conf /etc/nginx/sites-available/jsone
sudo ln -sf /etc/nginx/sites-available/jsone /etc/nginx/sites-enabled/jsone
# remove default if it conflicts
sudo nginx -t && sudo systemctl reload nginx
```

Set `server_name` to your VM hostname, LAN name, or public domain.

### HTTPS (public domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d jsone.com.my -d www.jsone.com.my
```

### LAN-only

Browse `http://<vm-ip>/`. Open firewall if needed:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 7. Sanity webhook

In Sanity Manage → API → Webhooks:

- URL: `https://your-domain/api/sanity-webhook` (**no query secret**)
- Add HTTP header `x-sanity-webhook-secret` = value of `SANITY_WEBHOOK_SECRET`  
  (or use Sanity’s signature / `Authorization: Bearer …`)
- On create/update/delete

The service user (`User=jsone` in `deploy/jsone-web.service`) must own `/var/www/jsone` and be able to `git pull`, `npm ci`, and write `web/dist`. With Nginx Option A (static from disk), a Node restart is usually unnecessary after content rebuilds.

### Monitoring rebuilds

```bash
curl -s http://127.0.0.1:4321/api/health | jq .rebuild
tail -n 50 /var/log/jsone/rebuild.log
```

Alert if a webhook returns `ok` but `logAgeSec` stays large (rebuild stuck) or `lastResult` is `failed` / `invalid_command`.

### Cache policy (HTML vs `_astro`)

| Path | Cache-Control | Why |
| ---- | ------------- | --- |
| `/_astro/*` | `public, max-age=31536000, immutable` | Content-hashed bundles/fonts from Astro/Vite |
| HTML (`/`, `*.html`) | `public, max-age=0, must-revalidate` | Publish + webhook rebuild must show up without waiting on CDN/browser TTL |
| Sanity image CDN | Controlled by Sanity | Responsive WebP/AVIF via `@sanity/image-url` |

Nginx sample (`deploy/nginx-jsone.conf`) and Node Option B (`server/`) both apply this split. Apex `jsone.com.my` should 301 to `https://www.jsone.com.my` so canonical URLs match `astro.config.mjs` `site` and `robots.txt` Sitemap.

### Faster publish (current vs future)

**Current (supported):** Sanity webhook → debounce → full `rebuild.sh` (`git pull` / `npm ci` as needed / `astro build` → swap `web/dist`). Production API is Node `server/` only.

**Not implemented:** edge purge-only, Astro hybrid ISR / on-demand revalidation, or selective page rebuild. Keep HTML uncached and rely on rebuild latency (~minutes). See [GO-LIVE.md](GO-LIVE.md).

## 8. Local smoke test (Windows / before VM)

```bash
npm run build
# optional for local API without Turnstile:
# set TURNSTILE_SKIP=true in web/.env
npm run start
# open http://localhost:4321
```

Or API-only while Astro runs separately:

```bash
npm run dev:web        # :4321 Astro (proxies /api → :8787)
npm run dev:server     # :8787 API (see server/.env.development)
```

## Troubleshooting

| Issue | Fix |
| ----- | --- |
| `staticReady: false` | `npm run build -w web`; check `STATIC_DIR` |
| 502 on `/api` | `systemctl status jsone-web`; port 4321 |
| Webhook 401 `secret_in_query_rejected` | Remove `?secret=` from URL; use header auth |
| Webhook 401 | Header/Bearer/signature mismatch |
| Webhook 500 `no_rebuild_configured` | Set `REBUILD_COMMAND` |
| Webhook 500 `rebuild_failed` / `invalid_command` | Absolute path only; no shell chars; script exists + executable |
| Permission denied on rebuild | `chown jsone:jsone /var/www/jsone`; do not rely on sudo under NoNewPrivileges |
| Contact `server_misconfigured` | Set Turnstile + Resend; unset `TURNSTILE_SKIP` in production |
| Contact turnstile_failed | Keys / domain allowlist in Turnstile dashboard |
| Contact 429 | Rate limit — wait and retry |

## Retired paths

Cloudflare Pages Functions (`web/functions/`) were removed in Phase 8. Do not point production traffic at Pages. GitHub Pages remains a **static preview** only ([CI.md](CI.md)).
