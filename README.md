# Yash ❤ Ayushi — Wedding Invite

Hugo static site, auto-deployed to GitHub Pages. All invite text lives in **one file**: `data/story.yaml`.

## Deploy (one time, ~10 min)

1. Create a GitHub repository named `yash-ayushi-wedding` (or anything — but the name becomes part of the URL).
2. Push these files to the `main` branch.
3. In the repo: **Settings → Pages → Source: GitHub Actions**.
4. Wait for the Actions run to go green — your invite is live at `https://YOUR-USERNAME.github.io/yash-ayushi-wedding/`.
5. In `hugo.toml` and `data/story.yaml` (→ `meta.baseurl`), replace `YOUR-USERNAME` with your GitHub username.

## Edit anything (works from the GitHub app on your phone)

- Names, dates, times, venues → edit `data/story.yaml` → commit → site rebuilds in ~1 min.
- 11pm spelling fix? Same flow. One file, one commit, done.

## WhatsApp preview (the grey-box test)

After deploy, paste the link into a WhatsApp chat with yourself. The preview card should show the
names, date, and image. If it shows nothing, check `meta.baseurl` in `data/story.yaml` — it must be
the exact live URL, and replace `static/images/og-image.png` with your caricature artwork (1200×630).

## Blessings box (Formspree)

1. Create a free form at https://formspree.io (name it e.g. "Wedding Blessings").
2. Copy the form URL into `data/story.yaml` → `blessings.formspree_id` (full URL or just the ID).
3. Blessings arrive in your email and in the Formspree dashboard (Submissions → export CSV).
   Guests stay on the card and see a thank-you note after sending.

## Custom domain (optional)

Buy a domain (e.g. `yashwedsayushi.in`), add it in **Settings → Pages → Custom domain**,
create a `CNAME` file in `static/` containing the domain, and point the DNS (CNAME) at
`YOUR-USERNAME.github.io`.

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
