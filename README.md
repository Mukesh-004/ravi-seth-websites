# Ravi Seth websites

Downloadable source packages for two independent websites:

| Package | Includes |
| --- | --- |
| [Real estate ZIP](Ravi-Seth-estate-2026-10-03.zip) | Sale and rental listings, property galleries, amenities, location maps, editorials, English and Telugu, backend and Content Studio |
| [Boutique and cars ZIP](Ravi-Seth-boutique-2026-10-03.zip) | Clothing catalogue, sizes, photos and videos, moderated purchase reviews, secondary car catalogue, backend and Content Studio |

Download and extract either ZIP to view the source code. Each includes setup instructions, Docker configuration, Google Sheets integration code and automated tests.

Use Node.js 24 or newer. Copy `.env.example` to `.env`, set a private `ADMIN_TOKEN`, then run `npm run dev:env`. Read the included `README.md` and `PACKAGE-README.md` before publishing. The website needs a persistent Node or Docker host for its SQLite database and uploaded media.

Both extracted packages passed all 39 automated tests. Responsive CSS was audited; a fresh mobile screenshot review remains unverified.

Listings, prices, photos and articles are samples. Replace them with verified business content before launch. Live Google Sheets delivery needs the one-time Apps Script setup described in each package. Private environment files, local databases and uploaded media are excluded.
