# Realness

**Prove a real, live human is on the other end of a remote conversation — right now.**

In an AI world, a polished LinkedIn profile, a clean company site, search results, mutuals, even voice and video can all be faked. The one thing that's still hard to fake is **a live human, present this instant, proving it on their own device.** Realness is that proof.

🔗 **Live:** https://realness.vercel.app · **Story demo:** https://realness.vercel.app/story

---

## What it does

Two phones do a **handshake**:

1. The **Requester** opens a session and shows a one-time link / QR.
2. The **Responder** opens it on their own phone and taps **"Verify I'm real."**
3. Their phone signs a fresh challenge behind a **live Face ID / Touch ID**.
4. The Requester's screen **blooms green** — *Verified human · just now*. No biometric or cancellation → it stays **red**.

We don't detect fakes. We **prove what's real**: a live person was present and passed an on-device biometric, this second.

## How it works (the privacy thesis)

Built on **WebAuthn / passkeys**:

- On first use, the phone's **Secure Enclave / TEE** generates a key pair. The **private key is non-exportable** — it never leaves the hardware, never appears on screen, never reaches our server.
- Each handshake, the server issues a **fresh random challenge** (anti-replay, 120s TTL). The phone signs it **only after a live biometric** (`userVerification: required`).
- Only a **public key** (once) and **per-handshake signatures** ever travel. The server stores just `{ publicKey, counter }` — **no biometric, no face data, no PII.**
- A bot or remote-control session can tap the button but **can't present a live face**, so the Enclave never signs → red. This is what defeats remote, scalable AI fraud.

**Honest boundary:** Realness proves *humanity + liveness*, not legal identity. A real human physically holding an unlocked phone (theft + passcode, or coercion) is device compromise — the same limit as Apple Pay or any passkey, and it doesn't scale the way AI fraud does.

## Stack

- **Frontend:** single-file vanilla-JS SPA (`index.html`), dark "Aurora Bloom" UI, vendored `@simplewebauthn/browser` + a QR generator. PWA-installable.
- **Backend:** Vercel serverless functions (`api/`, ESM) with `@simplewebauthn/server`.
- **Store:** Upstash Redis (cross-phone shared session + enrolled public keys).
- **Live updates:** the Requester polls the session until it flips green/red.

## Project layout

```
index.html              # the app (requester + responder flows)
story.html              # /story — narrative lead-in (fake LinkedIn DM → the proof)
api/
  setup/{options,verify}.js     # passkey enrollment (create)
  handshake/{options,verify,fail}.js  # live auth ceremony (sign)
  session/{create,[id]}.js      # shared cross-phone session create + poll
  health.js                     # diagnostic
  wipe.js                       # guarded demo-data flush
  _lib/{rp,store}.js            # RP-ID-from-host helper + Redis wrapper
manifest.webmanifest    # PWA manifest + icons
```

## Run / deploy

Deployed on Vercel (static root + `api/` serverless) with Upstash Redis env vars wired in. The RP ID is derived from the request host at runtime, so it binds to whatever domain serves it.

> Passkeys bind to the exact domain — use `realness.vercel.app` consistently; preview URLs won't find enrollments.

## Scope

**In:** live human-presence proof over a remote channel, on-device biometric, designed green/red states, QR + link handshake, PWA.
**Out:** accounts, revocation, multi-device sync, deepfake/video handling, AI-detection scoring, any LLM call.
