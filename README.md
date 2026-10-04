# Ravi Seth websites

## Separate project repositories

- [Real estate source and backend](https://github.com/Mukesh-004/ravi-seth-real-estate)
- [Boutique and cars source and backend](https://github.com/Mukesh-004/ravi-seth-boutique)

Each project runs independently with its own homepage, database and Content Studio. This repository retains the original shared project.

This repository contains the editable project source, including the public pages, backend, Content Studio, integrations and tests. Clone it with `git clone https://github.com/Mukesh-004/ravi-seth-websites.git`, then follow the run instructions below. Downloadable packages can be generated from the source with `powershell -File scripts/build-packages.ps1`.

The estate, boutique and car views share one codebase and mobile content studio. The two publish packages deploy independently: the estate package shows property and editorial content; the boutique package shows clothing and the secondary car section. Each deployment has its own SQLite database and media folder. The car view has a separate responsive 2D design with light motion that respects reduced-motion settings.

| View | URL | Purpose |
| --- | --- | --- |
| Estate | `/estate.html` or `/` | Sale and rent listings, property categories, search, editorials, About, English and Telugu |
| All properties | `/properties.html` | Separate sale/rent catalogue with plot, commercial plot, flat, villa and house filters |
| Property | `/property.html?id=e1` | Shareable detail page with multiple photos, specifications and call request |
| Boutique | `/boutique.html` | Clothing catalogue, sizes, galleries and moderated customer reviews |
| Clothing catalogue | `/collection.html` | Separate search and category page with photos, videos, sizes and reviews |
| Motor | `/cars.html` | Separate car view for sale and rent, with English and Telugu |
| Studio | `/admin.html` | Edit listings and editorials, upload photos and videos, approve reviews, read call requests |

## Run

Use Node 24 or newer. No package installation or paid account is needed.

```sh
npm run dev
npm run check
npm test
```

Open `http://127.0.0.1:4173/estate.html`, `http://127.0.0.1:4173/boutique.html`, or `http://127.0.0.1:4173/cars.html`. The server listens only on `127.0.0.1`. Set `SITE_VARIANT=estate` or `SITE_VARIANT=boutique` in `.env` for one deployment; local development defaults to all views.

The first run creates `data/site.sqlite` and seeds sample listings and articles. The estate examples use Visakhapatnam locations and are still fictional. Property pages include amenity icons, a Google Maps area view and related listings. The map uses the listing location or an optional more precise map query entered in Content Studio. It uses a Google Maps search embed and link without a paid Maps API key; confirm a precise pin when real property details are available. Studio edits update the database immediately. Open public pages receive a content event and refresh after an edit; a page left in another tab refreshes when opened again. Uploaded photos are resized in the browser and saved in `uploads/`. Uploaded videos are also saved there. Both folders are excluded from Git. Keep a backup of both folders before moving or replacing the project.

Estate call requests can include buying, renting or selling intent, a preferred area and a budget. Those fields are optional and appear in Content Studio and in the Sheet's existing Notes column. Every call request needs only a valid phone number and contact consent; name and extra details are optional. The backend labels a phone-only request as "Website visitor" so the Sheet can still accept it. Estate, boutique and car requests all enter the same Sheet queue, with a `source` value to distinguish them.

## Editing content

Open `/admin.html` on the same computer as the server. Add or edit listings in Real estate, Boutique or Cars. Estate and car listings have English and Telugu fields; boutique is English only. Estate entries include category, paired English/Telugu amenity and connectivity rows, and a map query. Add only features verified for that property. Useful amenity categories include parking, water, power, security, accessibility, lifts, outdoor space and shared facilities. Connectivity rows can describe verified roads, public transport, schools, healthcare and shops, with a distance or travel time when known. Boutique entries include sizes, fabric or material, fit and care. Mark boutique items as top sellers to place them on the boutique home page. Add up to 12 photos and 4 videos to each listing by selecting files or entering URLs. Each video can be up to 100 MB. Use MP4 with H.264 video for broad browser compatibility; MOV support depends on the visitor's browser. The media list order is the gallery order. Editorials have English and Telugu text. Call requests appear in the studio. Business details and social links can be updated in the **Business details** tab and appear on the estate site after saving.

Boutique ratings use clickable stars. A review requires a one-time code from a boutique call request. After confirming an offline purchase, staff can create that code from the request in Content Studio and share it with the purchaser. Submitted reviews still require moderation before they appear publicly. No checkout or automatic purchase verification is included yet.

The local server accepts studio changes without a token by default because it binds to localhost. Set `ADMIN_TOKEN` in `.env` to require one, then enter it in the studio. The server refuses to start on a public interface or in production without an admin token. Publish only behind HTTPS and keep the token private. For larger traffic or a multi-editor team, add proper sign-in, rate limits, spam protection and object storage.

The WhatsApp button uses `BUSINESS_WHATSAPP` in `src/core.mjs`. It remains inactive until an approved business number is added. It opens a prefilled WhatsApp conversation; it does not send a message automatically. Call requests are saved in SQLite first and can sync to the Google Sheet below. Email notifications, payments and reservations are not included.

## Connect call requests to Google Sheets

The [Call Requests Sheet](https://docs.google.com/spreadsheets/d/1a2W8xxgXSaUx1DjFQwiIHNq0gg8CvRNtXA1-1HxJCbs/edit) has been created with its column headers. The local server cannot use this chat's Google Drive connector directly, so complete this one-time Apps Script deployment to turn on delivery:

1. Open the Sheet and select **Extensions > Apps Script**.
2. Replace the default code with [google-sheets.gs](integrations/google-sheets.gs) and save it.
3. In Apps Script **Project Settings > Script Properties**, add `WEBHOOK_SECRET` with a long, random value. Keep it private.
4. Select **Deploy > New deployment > Web app**. Set **Execute as: Me** and **Who has access: Anyone**. This public endpoint is required for the local server's anonymous HTTP request, while the secret guards writes. Authorize the script and copy its `/exec` URL.
5. Copy `.env.example` to `.env`. Set `GOOGLE_SHEETS_WEBHOOK_URL` to the `/exec` URL, `GOOGLE_SHEETS_SECRET` to the same secret from step 3, and `ADMIN_TOKEN` to a different private value. Run `npm run dev:env` and enter the admin token in Content Studio.
6. Submit one test call request from a public page, then check **Call requests** in Content Studio and the Sheet. The studio shows pending, failed and synced requests. Use **Sync now** to retry. Requests saved before setup also sync after configuration.

The server never sends requests from the visitor's browser directly to Google. Each request remains in the local database if Google is unavailable and is retried automatically. The Apps Script uses the request ID to avoid duplicate Sheet rows. For production, protect the studio with real sign-in and restrict the server to HTTPS behind a trusted host.

## Search visibility

The site stays out of search results while it contains sample listings. On the final domain, set `SITE_URL=https://your-domain.example` and `PUBLISH_READY=true` in `.env` only after replacing fictional listings, images, prices and contact information with verified business content. The estate server then generates page titles, descriptions, canonical URLs, article structured data, `robots.txt` and a live `sitemap.xml` from current listings and editorials. Submit the sitemap in Google Search Console. Updating a listing or editorial updates its metadata and sitemap without a rebuild. Search appearance and ranking cannot be guaranteed; useful, accurate local content and real property media matter more than keyword stuffing.

The supplied images are illustrative Unsplash URLs. The reference site's hosted listing photos were inspected for layout and content structure, but not republished. If you own those images and want them on the new site, upload the originals through Content Studio to keep the site independent from the reference host. The reference plot page also included investment-return claims; these were not copied into the new site.

## Backend shape

The API lives in `src/backend.mjs`. It uses Node's built-in SQLite module, which is experimental in Node 24. The database has five tables: `listings`, `editorials`, `reviews`, `enquiries` and `meta`. Listing and editorial content is JSON inside rows, so new fields can be added without frequent schema migrations. The seed marker in `meta` prevents deleted sample content from returning after a restart. SQLite is the current shared backend for all views, so no Supabase account is needed to publish this version. Supabase Postgres and Storage can replace it later if the site grows beyond a single server. Notion is useful for planning, but customer phone numbers and inventory belong in the backend.

| Route | Use |
| --- | --- |
| `GET /api/listings?section=estate` | Public listings, with boutique and car sections too |
| `GET /api/settings` | Public business contact and social links |
| `PUT /api/settings` | Studio updates business details and links |
| `GET /api/events` | Live content events that refresh open public pages after studio edits |
| `POST` or `PUT /api/listings` | Studio creates or updates listing |
| `DELETE /api/listings/:id` | Studio deletes listing |
| `GET /api/editorials` | Public articles |
| `POST` or `PUT /api/editorials` | Studio creates or updates article |
| `POST /api/uploads` | Studio uploads one resized photo |
| `POST /api/media` | Studio uploads one MP4, WebM or MOV video |
| `POST /api/enquiries` | Visitor requests a call |
| `GET /api/admin/enquiries` | Studio reads requests |
| `GET /api/admin/sheets` | Studio reads Google Sheet connection and pending count |
| `POST /api/admin/sheets/sync` | Studio retries pending requests |
| `POST /api/reviews` | Visitor submits a pending clothing review |
| `GET /api/reviews?listing=:id` | Public approved reviews |
| `GET /api/admin/reviews` | Studio moderation queue |
| `PATCH /api/admin/reviews/:id` | Studio approves or rejects review |
| `POST /api/admin/enquiries/:id/review-invite` | Staff issues a one-time code after verifying a boutique purchase |

## Publish from the zip

Each zip contains its site pages, shared backend source, tests, Dockerfile, Compose file, Apps Script and setup notes. The estate and boutique zips are independent deployments with a matching `SITE_VARIANT` in their `.env.example`. They exclude `.env`, the local SQLite database and uploaded media. The included sample content is seeded on the first run. If you add real content locally before publishing, copy `data/` and `uploads/` separately to the host or migrate their contents into the persistent Docker volumes.

1. Choose a host that can run one persistent Node or Docker service and provide HTTPS for your domain. The service needs persistent storage for both `/app/data` and `/app/uploads`; an ephemeral web host will lose listings and media after a restart.
2. Unzip the package. Copy `.env.example` to `.env`. Set a long private `ADMIN_TOKEN`. Set the Google Sheet values if you completed the Apps Script steps above. Add the final `SITE_URL` and set `PUBLISH_READY=true` only when verified content is live. Never upload `.env` to a public repository.
3. With Docker Compose available, run `docker compose up --build -d` from the project directory. Compose maps the service to local port `4173` and creates persistent `ravi_data` and `ravi_uploads` volumes. Point your host's HTTPS reverse proxy at `127.0.0.1:4173`.
4. Open `/api/health`, then open `/admin.html`, enter the admin token, and replace all sample listings, photos, car details, prices and articles. Submit one test call request and confirm it appears in Content Studio and, after setup, in the Google Sheet.
5. Attach the domains and add the privacy policy and final business contact details. Keep regular backups of both persistent volumes.

Docker is not installed in this workspace, so the container build itself has not been run here. The Node server, API, tests and browser pages have been exercised locally.

Payments and stock reservations are not included. Add them only when the business is ready to take online payments.

All prices, inventory, images and article content currently shown are illustrative. Replace them with verified business information before launch. See `DESIGN_NOTES.md` for reference observations and `SITE_REVIEW.md` for a page-by-page review and launch priorities.
