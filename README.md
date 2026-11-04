# Yash ❤ Ayushi — Wedding Invite

Hugo static site, auto-deployed to GitHub Pages. All invite text lives in **one file**: `data/story.yaml`.

## Local testing vs live site

- `make serve` / `make phone` → **local test mode**: green "LOCAL TEST" ribbon, blessings are simulated (never sent).
- `make check` → builds the **production** site exactly like GitHub and fails if any test content would go live.
- Settings: `config/development/` (local) and `config/production/` (live). Details in DEPLOYMENT.md §1A.

## Deploy

Full step-by-step guide (GitHub Pages setup, safety checks, rollback, custom domain, Formspree):
**[DEPLOYMENT.md](DEPLOYMENT.md)**

Live at `https://www.cardbazaar.in/yash-weds-ayushi` after every push to `main`.

## Edit anything (works from the GitHub app on your phone)

- Names, dates, times, venues → edit `data/story.yaml` → commit → site rebuilds in ~1 min (see DEPLOYMENT.md §3 checklist).
- 11pm spelling fix? Same flow. One file, one commit, done.

## Blessings box (Formspree)

1. Create a free form at https://formspree.io (name it e.g. "Wedding Blessings").
2. Copy the form URL into `data/story.yaml` → `blessings.formspree_id` (full URL or just the ID).
3. Blessings arrive in your email and in the Formspree dashboard (Submissions → export CSV).
   Guests stay on the card and see a thank-you note after sending.

## Roadmap for v2

- [x] Interactive Vivaha quiz (edit questions in `data/story.yaml` → `quiz:`)
- [x] Travel cards + route buttons + journey strip (verify the two `TBD` distances in `travel:`)
- [x] "A Note From Us" typewriter letter (edit text in `note:`)
- [x] Wish-prompt chips in the blessings box (edit list in `wishes:`)
- [ ] Real caricatures (replace `static/images/hero-placeholder.svg` + regenerate `og-image.png` from them)
- [x] The film: 30-sec animated film drawn from `data/story.yaml` (`film/film.html`).
      Edit the story text, then `make film` to re-render `static/videos/wedding-film.mp4`.
      Preview it live by opening `film/film.html` in a browser (after one `make film`).
- [ ] Final hashtag (currently `#YashWedsAyushi` placeholder)
- [ ] Full venue address + exact Google Maps pin once confirmed
- [ ] Gallery section (lazy-loaded, WebP)
- [ ] "Add to Calendar" links per event
- [ ] Hindi taglines per section (space is reserved in the layout)
