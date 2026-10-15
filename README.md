# Navora for Stores — partner website (frontend preview)

The public website for store owners and local businesses who want to join Navora.
It is plain HTML, CSS and JavaScript with no frameworks, no build step needed to host, and no backend.

## One folder

Everything sits in this single folder: the HTML pages, `styles.css`, `main.js`, the two Fredoka font files and every image. There are no subfolders.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| How It Works | `how-it-works.html` |
| Features | `features.html` |
| Store App | `store-app.html` |
| Delivery | `delivery.html` |
| Settlements | `settlements.html` |
| Service Areas | `service-areas.html` |
| Partner With Us + application form | `partner.html` |
| Store Login | `login.html` |
| FAQ | `faq.html` |
| Help | `help.html` |
| Privacy (draft) | `privacy.html` |
| Terms (draft) | `terms.html` |
| Not found | `404.html` (GitHub Pages uses it automatically) |

## Publish on GitHub Pages

1. Create a repository, for example `navora-stores`.
2. Upload every file in this folder to the repository root, including the empty `.nojekyll` file.
3. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. To use a custom domain such as `stores.navoranow.com`, add it under Settings → Pages and create the DNS record your domain provider asks for.

## What works today (frontend only)

- Sticky header, mobile menu (Esc closes it), smooth in-page scrolling and fade-up reveals that respect reduced motion.
- **Partner application:** four steps (Business → Location → Delivery → Review) with validation for a 10-digit Indian mobile starting 6–9 and a 6-digit pincode. Delivery questions only appear when needed, and the review step has Edit links. Submitting shows **"Application Preview Complete"** and says plainly that nothing was sent. The draft lives in session storage for this browser tab only.
- **Availability check (demo):** `67612x` pincodes return Launch Area, `676`/`679`/`673` return Coming Soon, and anything else returns Availability not confirmed yet. Every result is labelled as an example.
- **Store Login:** mobile number → 6-digit OTP boxes (auto-advance, paste, backspace, 30-second resend timer) → "Login preview complete". No session is created.
- **Help:** each topic opens a support modal. The contact rows are placeholders, and the message form says "ready — not sent".
- FAQ accordion with plus/minus icons and smooth open and close.

## Connecting the backend later

All interactions live in `main.js`. Search for these blocks:

- `partner application` — replace the preview submit with a `fetch()` to the partner-application API.
- `store login` — send the OTP request and verify it.
- `availability checker` — replace the demo rules with a coverage API lookup.
- `support modal` — send the message to the support system.

## Content still to confirm

- Official support phone, WhatsApp and email (placeholders in the Help modal).
- Commission, payout cycle, taxes, refund and cancellation rules (the site says they're shared during onboarding).
- Final Privacy Policy and Terms (both pages are marked as drafts).
- Real Store App screenshots, if you want them to replace the built-in sample screens.

## Assets

- The logo, mascots, store, bag and parcel illustrations, product images and the Fredoka font are copied from the Navora Admin Panel, Store, Rider and Customer app folders, unchanged apart from resizing and conversion to WebP or WOFF.
- Body text uses the device's system font, so there is no extra download.
- Total page weight is about 1 MB, including all images.
