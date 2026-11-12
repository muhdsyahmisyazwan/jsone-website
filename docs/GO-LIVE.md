# Go-live runbook

**Single entrypoint for production.** Deep install steps live in [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md). Product truth: [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md). Quality gate: [ACCEPTANCE.md](ACCEPTANCE.md) (`npm run test:ci` + staging checklist).

| Use | Do not use |
| --- | ---------- |
| Ubuntu VM · Nginx · Node `server/` · `web/dist` | Cloudflare Pages Functions (removed) |
| Sanity webhook → `REBUILD_COMMAND` | GitHub Pages as `www.jsone.com.my` |

---

## Preflight

- [ ] DNS: apex `jsone.com.my` → 301 to `https://www.jsone.com.my`
- [ ] TLS cert on www (Certbot); HSTS after first green deploy
- [ ] Repo at `/var/www/jsone` owned by deploy user (`jsone`)
- [ ] `web/.env` filled from `web/.env.example` (see secrets table below)
- [ ] `npm ci` + `npm run build` succeeds on the VM
- [ ] systemd unit `jsone-web` enabled (`deploy/jsone-web.service`)
- [ ] Nginx config from `deploy/nginx-jsone.conf` (Option A preferred)
- [ ] Sanity webhook → `https://www.jsone.com.my/api/sanity-webhook` with header auth (**no** `?secret=`)
- [ ] Turnstile domain allowlist includes `www.jsone.com.my`
- [ ] Resend domain/from address verified

## Cutover smoke

```bash
curl -sS https://www.jsone.com.my/api/health | jq .
# expect staticReady: true, contact configured, webhook secret present

# Contact form in browser (Turnstile + email to CONTACT_TO_EMAIL)
# Studio Presentation → preview cookie → exit preview
# Publish a trivial change → webhook → rebuild.log updates within a few minutes
```

- [ ] `/` `/solutions/` `/contact/` load over HTTPS
- [ ] `/api/health` OK
- [ ] Contact email received
- [ ] Preview enter/exit works
- [ ] Webhook rebuild completes (`journalctl -u jsone-web` / `rebuild.log`)
- [ ] `robots.txt` Sitemap URL is `https://www.jsone.com.my/sitemap-index.xml`

## Rollback

1. Keep previous successful `web/dist` or git tag before deploy.
2. `cd /var/www/jsone && git checkout <known-good> && npm ci && npm run build`
3. `sudo systemctl restart jsone-web` (only if Node binary/env changed; HTML swap alone is enough for content)
4. Confirm `/api/health` and a key page.

---

## Backup checklist

| Asset | How | Cadence |
| ----- | --- | ------- |
| VM disk / snapshot | Cloud provider snapshot of the Ubuntu VM | Before major deploys; weekly |
| App tree | `/var/www/jsone` (git + `web/dist`) | Snapshot or `rsync` off-box |
| Rebuild logs | `/var/log/jsone/rebuild.log` | Retain with logrotate |
| Sanity content | Sanity Manage → dataset export / backup | Before schema migrations; monthly |
| TLS / Nginx | Certbot renewal + copy of `sites-available/jsone` | After config changes |
| Secrets inventory | Password manager list of env keys (not values in git) | With rotation |

---

## Env / secret rotation

| Secret | Where set | Also update |
| ------ | --------- | ----------- |
| `SANITY_WEBHOOK_SECRET` | `web/.env` / systemd `EnvironmentFile` | Sanity webhook header / signature secret |
| `SANITY_PREVIEW_SECRET` | same | Studio presentation / preview URL secret |
| `SANITY_API_READ_TOKEN` | same | Sanity API tokens (read) |
| `TURNSTILE_SECRET_KEY` (+ site key) | same + `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile dashboard |
| `RESEND_API_KEY` | same | Resend dashboard |
| Deploy SSH / git deploy key | VM + Git host | Rotate key; update authorized_keys |
| TLS private key | Let’s Encrypt | Certbot renew (automatic) |

### After rotating

1. Edit env on the VM; `sudo systemctl restart jsone-web`
2. `curl -sS https://www.jsone.com.my/api/health | jq .`
3. Submit contact once; trigger a test webhook publish
4. Confirm Studio preview still opens

**Suggested cadence:** review secrets quarterly; rotate webhook + preview secrets at least yearly or after staff changes.

---

## Related docs

| Doc | Role |
| --- | ---- |
| [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) | Full install (packages, systemd, Nginx, webhook) |
| [ADMIN.md](ADMIN.md) | Day-to-day CMS / form / rebuild ops |
| [CI.md](CI.md) | PR gates; GH Pages = preview only |
| [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md) | Hosting + locale decisions |
