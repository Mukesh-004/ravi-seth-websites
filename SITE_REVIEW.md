# Website review, 3 October 2026

## Final audit

The property map's location heading had extra horizontal padding, which made “03 / Location” drift away from the rest of the property content. That inset is removed. Amenity and connectivity lists now wrap in one column on narrow screens. Content Studio stores up to 60 amenity entries and 60 connectivity entries per property as paired English and Telugu labels, with older text entries migrated automatically. The estate and boutique publish packages use separate site modes and restrict unrelated pages and API content. Automated API, rendering helper, SEO, and packaging tests pass. A fresh visual screenshot audit of the localhost pages could not be completed because browser access to the local preview was blocked by the browser security policy; responsive findings here are based on CSS and component inspection.

## Real estate

The estate site now follows the reference's useful structure: a separate property catalogue, sale and rent filters, individual listings with galleries and facts, amenity icons, a Google Maps area view, a call request, and a separate editorial area. It uses fictional Visakhapatnam examples and a clearly labelled sample banner. The call form needs only a phone number and consent, then optionally captures a name, buying or renting intent, preferred area and budget. This gives the team enough context for a relevant follow-up without requiring visitors to complete a long form.

The next important upgrade is real inventory: original property photos and videos, exact locations, verified measurements, document status and actual prices. Replace the sample media and copy in Content Studio before enabling indexing. Do not present possible returns or approvals as facts until they have been independently checked.

## Boutique

The boutique has a focused top-sellers first view, a separate searchable clothing catalogue, size options, multiple photos and videos, material, fit and care fields, moderated verified-purchase reviews and a call request. A purchaser receives a one-time review code from staff after an offline purchase. The current product photos and prices remain examples. Final sizing, fabric, availability and exchange information should be added with the real collection.

## Cars

The car catalogue has a separate visual style, sale and rental filters, detail galleries, English and Telugu, restrained motion and reduced-motion support. Its scroll reveal CSS has been corrected and vertical spacing tightened. The car section is secondary to the boutique. The current cars are examples, so make, model, registration, condition, mileage and rental terms need verification before launch.

## Publishing priorities

1. Replace sample listings, editorial claims and remote stock images with approved information and owned media.
2. Add the business contact number and final domains. Connect the existing Google Sheet webhook.
3. Review the site's phone-consent and privacy wording with the business owner.
4. Set `SITE_URL` and `PUBLISH_READY=true`, then submit `/sitemap.xml` to Google Search Console.
5. Publish articles when they answer specific customer questions and have been checked against current official information.

The reference site was inspected with Apify. Its listing photos and text were not copied into the new site. The new estate pages keep the same practical user tasks while using their own layout and content.
