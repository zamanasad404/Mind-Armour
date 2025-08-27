
# Mind Armor (Tester PWA)

A professional, comforting Progressive Web App that bundles multiple insecurity-focused modules under one roof:
- **Confidence Shield** (free)
- **Clarity Helm** (public speaking)
- **Focus Gauntlets** (urge control)
- **Charm Boots** (social ease)
- **BedRock** (intimacy confidence)

This build is designed for testing UX and flows. No back end required; data is stored locally (LocalStorage).

## Features included
- Module locking/unlocking, streaks, micro‑dares
- Tester unlocks: "Simulate purchase", "Unlock all"
- Subscription/Lifetime simulation
- Stealth mode (decoy app name), module renaming
- Basic audio recording + faux analytics
- Breathing guides (4‑7‑8, box breathing)
- Conversation starters, grounding, wins log
- AI Coach placeholder (rule‑based, local)
- PWA install, offline cache, notification test
- Export/Import JSON, full data wipe
- PayPal button placeholder for later wiring

## Quick start (GitHub Pages)
1. Create a public repo, e.g., `MindArmor`.
2. Upload all files in this folder to the repo root.
3. Enable **Settings → Pages → Deploy from branch → / (root)**.
4. Wait for deploy, then visit your GitHub Pages URL.
5. Test PWA install. Use "Tester: Unlock all" and "Simulate purchase" to explore flows.

## Wire payments later
Replace the placeholder PayPal form action URL in **Settings → Plans & Payments** with your own button link (PayPal NCP or Checkout). In production, remove the tester buttons and set plan state from payment webhooks.

## Icons & theming
Maskable icons are included under `assets/icons`. Colors are defined in `css/styles.css`.

## Privacy
Local-only in tester. For production, add a real privacy policy and back-end with secure auth & encryption at rest.

---
© 2025 Mind Armor (Tester)
