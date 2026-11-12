# Casidar Gadgets Website

A showcase site for Casidar Gadgets, a shop for **pre-owned and brand-new iPhones and iPads** (iPhone 6 to the latest, old to new iPads) with its main store at
Brittany 1, Antipolo City and a branch at Gold Land, Cainta.

Stock changes every week, so the site **does not list units**. Customers use the request builder to
**ask if a model is in stock** or **pre-order** it (model, storage, condition, battery health, color, budget, branch).

Plain HTML, CSS and JS with no build step. Open `index.html`, or deploy the folder to Vercel or Netlify.

## Pages and files
| File | What it is |
|---|---|
| `index.html` + `home.js` | Home page, with an interactive "What would you like to do?" picker that links to the form |
| `request.html` + `request.js` | The full Ask / Pre-order form |
| `common.js` | Shared code: theme, menu, footer contacts, animations |
| `styles.css` | All styles |
| `config.js` | Shop settings (edit this) |

Links can pre-fill the form, e.g. `request.html?mode=preorder&device=iphone&series=iPhone%2015`.
Supported: `mode` (ask/preorder), `device` (iphone/ipad), `series`, `model`, `storage`, `type`,
`get` (delivery/lbc), `branch` (cainta/antipolo), `trade=1`. These are handy for Facebook posts.

## Editing
| What | Where |
|---|---|
| Phone, Messenger page, Viber, email, Facebook | `config.js` → `contact` |
| Branch names, addresses, map search | `config.js` → `branches` |
| iPhone / iPad models in the request form | `config.js` → `models` |
| "Available now" chips (e.g. iPhone 6 · 32GB) | `config.js` → `availableNow`. Update when a batch arrives; `[]` hides them. |
| Unit types (Pre-owned / Brand new) | `config.js` → `types` |
| Photos | `assets/photos/` (keep the same file names to swap them) |

Everything marked `TODO` in `config.js` is a placeholder.

## How requests work
The form builds a ready-to-send message. The customer picks Messenger, SMS, Viber or email.
No server is needed. Messenger can't pre-fill text, so the site copies the message for the customer to paste.

## Photos
The photos in `assets/photos/` are free stock photos (Unsplash and Pexels, see `CREDITS.md`).
Swapping in the shop's own photos makes the site feel much more trustworthy. To replace one,
save the new photo **with the same file name** and keep it under about 300 KB.

| File | Used for | Shape |
|---|---|---|
| hero-iphone-hand.jpg | Hero center, trade-in | Portrait (3:4) |
| iphones-orange.jpg | Hero left, iPhone card | Landscape |
| ipads-stack.jpg | Hero right | Landscape |
| ipad-desk.jpg | iPad card | Landscape |
| iphone-yellow.jpg | Trade-in banner | Any; it gets cropped wide |
| iphone-blue.jpg | Quality check section | Portrait (4:5) |
| iphone-dark.jpg / ipad-blue.jpg | Device buttons in the form | Square crop |
| iphones-pattern.jpg | Footer background | Landscape |

Photo tips: shoot real units in the shop near a window, on a clean dark or white surface.
Keep the phone sharp and avoid glare.
