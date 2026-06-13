# Session Context

---
## 2026-06-13

**Status:** Built + deployed + server-verified. Live at https://realness.vercel.app/ (public repo github.com/pearl04/realness). Only remaining step: real two-phone biometric run.
**Last worked on:**
- Built "Realness" — WebAuthn human-to-human handshake (Node serverless on Vercel + Upstash Redis + vanilla JS frontend, Aurora Bloom dark UI).
- Deployed via GitHub→Vercel; smoke-tested all non-biometric paths (session, RP ID = realness.vercel.app, fresh challenges, residentKey/UV required).
- Applied Pearl's UI notes (green bloom transition, Face ID line glyph replacing emoji, verified timestamp, softened RED copy); added /api/health + guarded /api/wipe.
**Key decisions:** Vercel (GitHub already connected) over Render; static at repo root (not public/) for reliable serving; RP ID derived from host header at runtime; handshake = auth ceremony w/ allowCredentials:[] (discoverable passkeys); RED = cancel biometric / unenrolled device.
**Watch out for:** Use realness.vercel.app EXACTLY for all phones (passkeys bind to domain — no preview URLs). RED demo phone should CANCEL the Face ID prompt (a 2nd iPhone on same Apple ID may have synced passkey → false GREEN). Never put Pearl's personal email in git (use pearl04@users.noreply.github.com). cred:* has no TTL (Pearl declined TTL, chose wipe endpoint instead).
**Next up:** Two-phone live test; tune bloom/copy/timing after Pearl sees it on device; rehearse ~80s demo; optional PWA install check.
---
