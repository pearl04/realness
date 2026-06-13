# Realness — Build PRD

## What this is
A mobile web app that lets one person verify that **a real, live human is on the other end of a conversation — right now**, even if that person is 1,000 miles away. Built for a world where any profile, face, voice, or message online can be faked by AI.

We do **not** detect fakes and we do **not** output a "this is probably an AI" score. We make fakery irrelevant by requiring a proof that only a real, live human on their own device can produce. The result is binary: **verified human, or unverified.**

## The three winning criteria — NON-NEGOTIABLE
Straight from the hackathon rubric. Every build decision serves these.
1. **Originality** — A forward-looking *human-to-human realness handshake*, not a login feature. B2C, original, not a calendar/fitness/to-do app.
2. **UI/UX** — Clear, fast, mobile-native, *pleasant*. The verified and unverified states must be **felt**, not read. This is half the magic — protect the styling time.
3. **Execution** — A real, working, deployed thing a judge can try on their own phone in the room. Public repo. Success and failure are **real**, not simulated.

## The core concept: a remote handshake
This is the heart of the product. Two people who are NOT in the same place verify each other:
- A **Requester** wants to confirm the person they're talking to (e.g. a LinkedIn DM sender) is a real human.
- They send a one-time **handshake** to the other person (a link / QR / code — in the real product, dropped inside the LinkedIn DM).
- The **Responder** completes it on **their own** phone with **their own** biometric.
- The Requester's phone updates live: **GREEN (verified human)** or stays **RED (unverified)**.

The proof travels between the two phones. The biometric / face never leaves the responder's device.

## What the user MUST experience (non-negotiable core loop)

**Part 1 — Setup (one time, "make myself verifiable")**
1. Open the app (QR or link). "Become verifiable."
2. Tap Set up → phone prompts **Face ID / fingerprint** → phone creates a secret key locked behind the live biometric, stored on-device.
3. Done. Never repeated.

**Part 2 — The handshake (the repeatable magic)**
1. Requester taps **"Request a handshake"** → app generates a one-time handshake (link / QR / code) tied to a shared session.
2. Requester sends it to the other person (demo: judge scans/opens it).
3. Responder's phone opens: "Someone wants to verify you're a real human. Verify?"
4. Responder taps Verify → **their** phone prompts **their** biometric → their phone signs a **fresh one-time challenge**.
5. Requester's phone updates **live** to **GREEN — "Verified: real, live human, just now."**
6. If the responder is a bot / AI agent / unenrolled device / doesn't complete → Requester's phone stays **RED — "Could not verify a human."** This must be a clean designed state, never a browser error.

**Critical framing baked into the UI copy:** never say "this is an AI" or show a confidence %. GREEN = verified human. Anything else = **unverified** (not an accusation).

## How we will demo it (build toward this exact moment)
~80 seconds, shark-tank room, on real phones:
1. Presenter sends a handshake to a judge.
2. Judge taps Verify + biometric on **their own** phone.
3. Presenter's phone blooms **GREEN** — "verified a real human on a phone I don't hold, a face I never saw."
4. A second, un-set-up phone (the "bot / fake") attempts → **RED**.
5. Line: "Completes = real human. Doesn't = you've been warned. We don't detect fakes — we prove what's real."

Both GREEN and RED must show clearly on phone screens. GREEN is the hero moment — make it bloom.

## Hard technical requirements (whatever stack you choose)
- Use **device-bound passkey / WebAuthn (FIDO)** so the biometric stays on-device and only a cryptographic signature leaves the phone. This is the entire security thesis — non-negotiable.
- The two phones must share a **live session**: requester creates it, responder writes a verified signature to it, requester's phone reflects the result in near-real-time (polling or realtime subscription both fine).
- Must run over **HTTPS** on a public URL (no localhost-only). Relying-party ID must match the deployed domain exactly.
- Must **force on-device platform biometric** (platform authenticator, user verification required) — not an external security-key prompt.
- Each proof must use a **fresh server-issued challenge** (no replay).
- The failure path must render as a **designed RED state**, not an exception.
- Should be **installable to home screen (PWA)** so it demos as a real app.

## Stack — your call (suggestions only, optimize for speed)
Any framework that ships fast on free HTTPS hosting. A reasonable path: a JS web framework on a free host + a WebAuthn library to handle the crypto + a minimal shared store / realtime layer for the session. Pick whatever gets a live GREEN across two real phones fastest. Do not over-engineer.

## Build priority + cut order
Build in order; if time runs short, cut from the bottom.
1. Deploy a live HTTPS page that loads on a phone (do this FIRST).
2. Setup: enroll a device with on-device biometric (creates the key).
3. Handshake: requester creates session → responder verifies on their own phone → requester's phone shows live **GREEN**. *(This is the product.)*
4. **RED** state for an unenrolled / non-completing responder, as a designed state.
5. QR / link to open + send a handshake.
6. Felt UI: green bloom, red state, big confident copy.
7. PWA installability.

**Never cut:** real GREEN across two phones (the handshake), real RED for the fake, send/scan a handshake. Those three *are* the win.

## Out of scope (do NOT build)
Multi-device/revocation, accounts, any deepfake *video* handling, any AI-detection scoring, any LLM call. Note these as "future" only.

## One-line product vision (for the pitch, not to build)
"Today: a standalone app you set up in 10 seconds. Tomorrow: a 'Verify Realness' button inside LinkedIn, dating apps, marketplaces, P2P payments, and the call from your 'daughter' asking for money."
