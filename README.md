# CIN and LLPIN checker

Static page, no build step, no dependencies. Open `index.html`, or host the folder anywhere (GitHub Pages, Netlify, Vercel).

- `cin.js` decoder (pure functions, also runs in Node)
- `index.html` page and styles
- `test.js` run with `node test.js`
- `ui.js` browser test (needs playwright-core and Chrome)

## What it checks
CIN, 21 characters: listing (L/U), 5 digit industry code, 2 letter state code, 4 digit year, 3 letter company type, 6 digit registration number. LLPIN: 3 letters, dash, 4 digits.
Invalid input returns each specific problem (length, symbols, bad state code, future year, unknown type and so on).
A LLPIN carries no state, year or type, so none is shown.

## Validation coverage and what is sourced
- Structure (21 characters; L/U; 5 digits; 2 letters; 4 digit year; 3 letters; 6 digits): consistent across the TaxGuru, CS Pratik K Shah and GetMyCA guides, and every one of the 534 CINs checked in MCA's own published list (List_of_Companies_2014.pdf) fits it.
- Company type codes recognised: PLC, PTC, OPC, NPL, FTC, FLC, GAP, GAT, GOI, SGC, ULL, ULT (TaxGuru, CS Pratik K Shah). MCA's 2014 list itself only contained PTC, PLC, NPL, OPC, FTC, so the other codes rest on the two guides.
- State codes: classic codes from CS Pratik K Shah. MCA's 2014 list also contains PN and TZ, which that table lacks, so the table also includes newer RoC-based codes PN, MR, ME, UW, DC, WR, TZ and older CT, UR, TS, OD, mapped per companysregistration.com and a dev.to MCA-register analysis. These two are secondary sources. MCA does not publish a code table we could find.
- A well-formed code that is not in the tables is NOT rejected. It shows an amber "format OK, code not recognised" badge with a note and "Not recognised" in that field.
- Only shape errors are rejected (wrong length, symbols, wrong character class in a part, first letter not L/U, future year). Years before 1850 get a note.
- FCRN (F plus 5 digits, foreign companies, seen in the MCA list) is explained as not a CIN/LLPIN.
- LLPIN: 3 letters + 4 digits per the guides. LLPIN structure was not independently verified from an MCA document.
- Syntax only. It does not look up MCA, so a valid-looking number may not exist.

## Tests
`node test.js` (decoder). The UI was exercised in headless Chrome at 1280px and 390px: empty, whitespace only, example, duplicates, filters, 500 lines with show-more, copy CSV, clear, no console errors, no horizontal scroll.

## Sources
- https://www.mca.gov.in/Ministry/pdf/List_of_Companies_2014.pdf
- https://learn.cspratik.com/docs/other-resources/state-codes-cin-format/
- https://taxguru.in/company-law/understanding-corporate-identification-number-cin.html
- https://www.getmyca.com/blog/cin-number-meaning-format-mca-search
- https://companysregistration.com/blogs/registration-trend/state-from-cin-company-registration-data-explained
- https://dev.to/datadaemon/how-many-companies-were-registered-in-india-in-october-2026-17622-new-companies-by-state-type-2h9b
- MCA master data (for real lookups): https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS/company-master-info.html

## Work log (not an AI transcript)
This is a summary written after the fact. It is not the unedited AI conversation the employer asked for.
1. Read the brief. Researched the CIN layout from the sources above.
2. AI generated the decoder, tests and page. Tests (`node test.js`) pass.
3. Checked screenshots at 1280px and 390px, empty state, example, and 500 lines (first 100 shown, "show more" for the rest). No horizontal scroll.
4. Added newer state codes (PN, TZ and others) after finding them in MCA's own 2014 list, and stopped rejecting unrecognised-but-well-formed codes.
