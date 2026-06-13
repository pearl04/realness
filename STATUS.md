# Realness — Project Status & Handoff

> One-glance map of what's done, what's left, and how the finished thing should look.
> Full spec: [`realness-prd.md`](./realness-prd.md) · Session history: [`devlog.md`](./devlog.md)

## What this is
A mobile web app that proves **a real, live human is on the other end of a conversation — right now**, even remotely. Two phones do a **handshake**: a Requester sends a one-time link/QR; the Responder completes a live biometric (WebAuthn passkey) on their own phone; the Requester's phone blooms **GREEN (verified human)** or stays **RED (unverified)**. We don't detect fakes — we prove what's real. Biometric never leaves the device; only a public key + one-time signatures travel.

## Live
- App: https://realness.vercel.app/
- Repo: https://github.com/pearl04/realness (public)
- Host: Vercel (serverless `api/` + static root) · Store: Upstash Redis
- Reset data anytime: `curl -X POST "https://realness.vercel.app/api/wipe?confirm=$WIPE_TOKEN"` (token lives only in Vercel env, not the repo)

## Done ✅
- [x] Live HTTPS deploy loading on a phone (RP ID = realness.vercel.app, exact)
- [x] Setup: enroll device with on-device biometric → device-bound passkey (`api/setup/*`)
- [x] Handshake: requester session + responder live auth ceremony + polling (`api/session/*`, `api/handshake/*`)
- [x] Fresh server-issued challenge per ceremony (anti-replay)
- [x] Platform authenticator + user-verification forced; discoverable passkeys
- [x] First-time responder phones enroll inline during the handshake, so there is no visible "set it up first" detour
- [x] Designed GREEN bloom + RED states (no raw browser errors)
- [x] QR + copy-link to send a handshake
- [x] Felt UI: Aurora Bloom dark theme, green bloom transition, Face ID line glyph, verified timestamp
- [x] PWA manifest + installable icons
- [x] Privacy verified: no biometric/PII stored; `/api/health` diagnostic; guarded `/api/wipe`
- [x] Public repo, clean git history (noreply identity, no secrets)

## Left to do ⬜
- [ ] **Real two-phone biometric run** (the only path untestable without devices) — request on laptop/phone A, scan on phone B, tap once, confirm GREEN bloom; cancel biometric → RED
- [ ] Tune bloom intensity / copy / timing after seeing it on a real device
- [ ] Rehearse the ~80-second demo
- [ ] Optional: confirm PWA "Add to Home Screen" on iOS + Android

## Demo choreography (~80s)
1. Your laptop/phone → **Request a handshake** → QR appears
2. Judge scans QR → **Verify I'm real** → their Face ID
3. Your laptop/phone blooms **GREEN** — "Verified human · VERIFIED hh:mm:ss" (the hero moment)
4. Fresh handshake → judge scans again → **cancel the biometric prompt** → RED
5. Line: "Completes = real human. Doesn't = you've been warned. We don't detect fakes — we prove what's real."

## Gotchas (read before the room)
- Use `realness.vercel.app` EXACTLY on every phone — passkeys bind to the domain; preview URLs won't find enrollments.
- For the RED phone, **cancel the Face ID prompt** (a 2nd iPhone on the same Apple ID may have an iCloud-synced passkey and falsely go GREEN).
- `cred:*` keys have no TTL by design — wipe with the command above when done.

## Out of scope (PRD)
Accounts, revocation, multi-device, deepfake/video handling, AI-detection scoring, any LLM call.
