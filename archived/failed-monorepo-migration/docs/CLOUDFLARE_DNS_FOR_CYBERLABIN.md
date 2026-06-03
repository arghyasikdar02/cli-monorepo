# Cloudflare DNS for cyberlabin.com

## Add Domain
1. Log in to Cloudflare.
2. Add `cyberlabin.com`.
3. Choose the Free plan for MVP.

## Update Registrar Nameservers
1. Cloudflare will show two nameservers.
2. Go to your domain registrar.
3. Replace existing nameservers with Cloudflare nameservers.
4. Wait for propagation.

## Add Vercel DNS Records
In Cloudflare DNS, add records exactly as Vercel provides. Common setup:
- `A` record for root `@` to Vercel IP if provided.
- `CNAME` record for `www` to `cname.vercel-dns.com`.

Keep proxy setting according to Vercel guidance. If SSL issues occur, temporarily set records to DNS only while verifying.

## SSL/TLS
- Set SSL/TLS mode to **Full**.
- Enable **Always Use HTTPS**.
- Enable Automatic HTTPS Rewrites.

## Basic WAF/Security
- Enable Cloudflare WAF managed rules where available.
- Add rate limiting/security rules for obvious abuse paths if available on your plan.
- Block suspicious countries only if it does not affect your learners.
- Keep DNSSEC enabled if your registrar supports it.

