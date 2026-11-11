# Deploy on Ubuntu VM (Nginx + Node)

The site is **static Astro output** (`web/dist`) plus a **Node API** (`server/`) for contact, preview, and Sanity rebuild webhooks. Cloudflare Pages Functions are optional/legacy.

## Architecture

```
Browser → Nginx :80/:443
            ├─ /*        → files in web/dist
            └─ /api/*    → Node on 127.0.0.1:4321
Sanity webhook → https://your-host/api/sanity-webhook → rebuild.sh
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

```bash
sudo mkdir -p /var/www/jsone
sudo chown "$USER:$USER" /var/www/jsone
git clone <your-repo-url> /var/www/jsone
cd /var/www/jsone
npm install
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

# Rebuild from Sanity
SANITY_WEBHOOK_SECRET=long-random-string
REBUILD_COMMAND=/var/www/jsone/scripts/rebuild.sh

SANITY_PREVIEW_SECRET=another-long-random-string
SITE_ORIGIN=https://jsone.com.my
```

Also set Studio env (`studio/.env`) with the same project id and `SANITY_STUDIO_PREVIEW_ORIGIN=https://jsone.com.my`.

```bash
chmod 600 web/.env
chmod +x scripts/rebuild.sh
```

Edit `scripts/rebuild.sh` if the app path is not `/var/www/jsone`.

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

- URL: `https://your-domain/api/sanity-webhook?secret=<SANITY_WEBHOOK_SECRET>`
- On create/update/delete

Ensure `www-data` (or the service user) can run `scripts/rebuild.sh` (git pull, npm, write to `web/dist`). Often easier to run the service as a deploy user that owns `/var/www/jsone`, and adjust `User=` in the unit file.

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
| Webhook 401 | Secret mismatch |
| Webhook 500 `no_rebuild_configured` | Set `REBUILD_COMMAND` |
| Permission denied on rebuild | Ownership of `/var/www/jsone`, sudoers for systemctl if used |
| Contact turnstile_failed | Keys / domain allowlist in Turnstile dashboard |

## Legacy Cloudflare Functions

`web/functions/` remains for optional Cloudflare Pages hosting. Prefer `server/` on Ubuntu.
