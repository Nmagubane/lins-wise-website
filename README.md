# Lins-Wise Accountants Inc. website

A static, front-end-only website: `index.html`, `styles.css`, `script.js` and `assets/`.
There is no database, no cookies and no local storage. Nothing a visitor types is kept by the site.

## Contact options
- **WhatsApp**: the floating button and every WhatsApp link open a chat with 079 917 6461 (`wa.me/27799176461`) with a greeting already filled in.
- **Quotation form**: posts to [FormSubmit](https://formsubmit.co), which emails the details to **ssmagubane97@gmail.com**. FormSubmit forwards the message and doesn't keep a database of submissions.
- If sending fails (no internet, say), the visitor gets one-tap buttons to send the same details by WhatsApp or email instead.

## Before going live (one-time)
1. **Host the site.** Upload the folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, or the cPanel of your linswise domain).
   FormSubmit does **not** work when `index.html` is opened directly from disk (`file://`). It must be served from a web address.
2. **Activate the form.** Submit the form once from the live site. FormSubmit sends an activation email to ssmagubane97@gmail.com.
   Click **Activate Form** in that email. Until then, enquiries are not delivered.
3. **Optional: hide the email address from the page source.** After activating, FormSubmit gives you a random alias (e.g. `a1b2c3...`).
   Replace `ssmagubane97@gmail.com` with that alias in `script.js` (`FORM_EMAIL`) and in the `action` of the form in `index.html`.

## Editing
- Phone number: `WA_NUMBER` in `script.js`, plus the `tel:` links and the visible numbers in `index.html`.
- Prices and package contents: the `.pkg` blocks in `index.html` (and the matching options in the form's Package dropdown).
- Colours and type: the `:root` tokens at the top of `styles.css`.

## Font
Archivo (variable width and weight) is loaded from Google Fonts. To self-host it instead, download the woff2 files,
put them in `assets/fonts/`, replace the Google Fonts `<link>` with an `@font-face` rule, and remove the two `preconnect` lines.
