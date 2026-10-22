# Deployment Guide: Yash ❤ Ayushi Wedding Card

How this repository goes live on **GitHub Pages**, how to deploy updates safely, how to roll back, and how to put the card on your own **custom domain**.

| | |
|---|---|
| Repository | `https://github.com/YashWonder3/yash-ayushi-wedding-card` |
| Branch that deploys | `main` |
| Live address (default) | `https://yashwonder3.github.io/yash-ayushi-wedding-card/` |
| Site generator | Hugo **0.136.5 extended** (same version locally and on GitHub) |
| Blessings form | Formspree: `https://formspree.io/f/moejbqlb` |

---

## 1. How deployment works

```
 You (Mac)                         GitHub                                   Guests
 ─────────                         ──────                                   ──────
 edit data/story.yaml …   push →   Actions: "Deploy to GitHub Pages"
                                   1. checkout code
                                   2. install Hugo 0.136.5
                                   3. ask Pages for the live address  ──┐  (github.io or your domain)
                                   4. hugo --gc --minify --baseURL …  ◄─┘
                                   5. SAFETY CHECK (stops if anything is wrong)
                                   6. upload ./public  →  deploy  →  live site  →  open link
```

- **Built on GitHub, not on your Mac.** The `public/` folder is recreated on every deploy, so it is git-ignored on purpose.
- **The address is automatic.** The workflow asks GitHub Pages for the current address. When you add a custom domain later, the site, the WhatsApp preview image and every link switch to it on the next deploy, with **no code change**.
- **Only one deploy runs at a time**, and a newer push never cancels a deploy that is already publishing.

### What is published, and what is not

| Published (pushed to GitHub) | Never published |
|---|---|
| `data/`, `layouts/`, `static/`, `config/` | `assets-src/` (full song MP3, original screenshot) |
| `.github/workflows/deploy.yml` | `public/` (rebuilt by GitHub) |
| `film/` scripts (not `node_modules`, `.browsers`, `.cache`) | `.hugo_build.lock`, `resources/`, `.DS_Store`, `.prod-build/` |
| `preview.html`, `README.md`, `DEPLOYMENT.md`, `Makefile`, `tools/` | |

Keep a backup of `assets-src/` (for example in Google Drive). It only exists on your Mac.

---

## 1A. Local testing vs production (kept separate)

The same code builds in two **environments**. Settings live in `config/`:

| | **Local testing** (`development`) | **Live site** (`production`) |
|---|---|---|
| Used by | `make serve`, `make phone`, `make preview` | `make build`, `make check`, **GitHub Actions** |
| Settings file | `config/development/hugo.toml` | `config/production/hugo.toml` |
| Address | `http://localhost:1313/` (or your Wi-Fi IP for the phone) | `https://yashwonder3.github.io/yash-ayushi-wedding-card/` or your custom domain |
| Green **"LOCAL TEST · not the live site"** ribbon | ✅ shown at the bottom | ❌ never |
| Browser tab title | `[LOCAL TEST] Yash ❤ Ayushi …` | `Yash ❤ Ayushi …` |
| Blessings | **simulated:** the thank-you note shows, but nothing is sent | sent to the real Formspree form `moejbqlb` |
| Search engines | blocked (`noindex`) | normal |

Shared settings (title, description) are in `config/_default/hugo.toml`.

**Guarantees:**
- Test blessings can never land in your real inbox.
- Local mode can never reach guests: `make check` and the GitHub safety gate both **fail the build** if the ribbon, simulated form or "LOCAL TEST" text appears in a production page.

**Testing real email delivery without touching the real inbox:**
1. Create a **second** Formspree form, e.g. "Wedding Blessings TEST".
2. Put its URL in `config/development/hugo.toml` → `formspreeTest = "https://formspree.io/f/xxxxxxx"`.
3. Local sends now go to that test form. Production still uses `moejbqlb` from `data/story.yaml`.

---

## 2. One-time GitHub setup

Do these once, in the repository on github.com.

1. **Repository visibility**
   - Free GitHub accounts can only use Pages with a **public** repository. (GitHub Pro can publish from a private one.)
   - Anything pushed is visible to anyone, which is why `assets-src/` is git-ignored.

2. **Turn on Pages from Actions**
   - **Settings → Pages → Build and deployment → Source: `GitHub Actions`**.
   - Do *not* choose "Deploy from a branch". The workflow handles everything.

3. **Allow the workflow to run**
   - **Settings → Actions → General → Actions permissions:** "Allow all actions and reusable workflows", or at least allow `actions/*` and `peaceiris/actions-hugo`.
   - **Workflow permissions:** "Read repository contents" is enough. The workflow requests `pages: write` and `id-token: write` itself.

4. **Protect the live environment**
   - **Settings → Environments → `github-pages` → Deployment branches and tags → Selected branches → add `main`**.
   - This makes sure only `main` can ever go live.

5. **(Recommended) Protect `main`**
   - **Settings → Branches → Add rule for `main`:** block force pushes and deletions, so the history you roll back to can't be lost.

---

## 3. Before every deploy: checklist

Run through this on your Mac before pushing.

### 3.1 Content
- [ ] **Re-open `data/story.yaml` from disk before editing.** An editor holding an old copy has overwritten this file several times. Use **File → Revert / Reload** first.
- [ ] Names, dates, times and venue in `story.yaml` are final.
- [ ] `story.yaml` is valid YAML:
  ```bash
  ruby -ryaml -e 'YAML.load_file("data/story.yaml"); puts "story.yaml OK"'
  ```
- [ ] Optional placeholders, if you want them on the card:
  - `couple.hashtag`: the final hashtag (currently `#YashWedsAyushi`).
  - Emergency contact: add `travel: → help: → name / phone`. The box stays hidden until `phone` is set.

### 3.2 Regenerate derived files (only if their inputs changed)

| You changed… | Run | Updates |
|---|---|---|
| anything in `story.yaml` / layout | `make preview` | `preview.html`, `film/story.js` |
| names / date / city / logo | `make og` | `static/images/og-image.png` (WhatsApp preview) |
| story text used in the film | `make film` | the film + poster (re-adds the song automatically) |
| song or song start (`film.music`, `film.music_start`) | `make music` | the film's soundtrack only |

### 3.3 Test locally (local-testing mode, with the green ribbon)
```bash
make serve        # on the Mac → http://localhost:1313/
make phone        # on your phone (same Wi-Fi) → prints http://<your-IP>:1515/
```
Check:
- [ ] The scroll intro and flowers play (open the address **without** a `#…` at the end).
- [ ] Ganesh Ji, the shloka, names and dates are correct.
- [ ] The travel cards open Google Maps.
- [ ] The film plays **with sound**.
- [ ] The quiz runs to the end.
- [ ] The blessings form shows the thank-you note after sending.

### 3.4 Run the same production build GitHub will run
```bash
make check        # → "✓ Production build is clean"  (fails if any local/test content would go live)
```

---

## 4. Deploy

```bash
git status                       # review what will be pushed (assets-src/ must NOT appear)
git add -A
git commit -m "Describe the change"
git push origin main
```
Or simply `make deploy` (it runs `hugo --gc --minify` and `make preview`, then commits and pushes).

Then:
1. Open **GitHub → Actions → "Deploy to GitHub Pages"** and watch the run.
2. **build** (about 30 s) → **deploy** (about 30 s). Both must show ✅.
3. The run summary shows the live link.

### Safety gate: what the build checks before anything goes live

If any check fails, the deploy stops and **the currently live site stays untouched**.

| Check | Protects against |
|---|---|
| `index.html` exists and isn't empty | a broken template |
| CSS, JS, logo, Ganesh Ji, Shiva–Shakti art, film, poster and WhatsApp image all exist | a missing file / blank card |
| no `localhost`, `192.168.…` or `YOUR-USERNAME` in the page | test addresses leaking to guests |
| no test ribbon / simulated form / "LOCAL TEST" in the page | local testing mode reaching guests |
| WhatsApp preview image (`og:image`) is a full `https://` link | WhatsApp showing no preview |
| blessings form points at `formspree.io/f/` | blessings silently going nowhere |

---

## 5. After every deploy: verify production

Open the live link (on your phone, mobile data **and** Wi-Fi):

- [ ] Page loads with styles (cream scroll, gold rods). If it's unstyled, see §9.
- [ ] Scroll intro + flowers → Ganesh Ji + shloka → names → dates.
- [ ] **Film plays with sound** (tap ▶).
- [ ] Travel buttons open Google Maps.
- [ ] Send **one test blessing** → it arrives in your email or the Formspree dashboard.
- [ ] **WhatsApp preview:** paste the link in a chat with yourself. You should see the card image, title and description.
  - WhatsApp caches previews. If an old preview shows, paste the link with `?v=2` at the end (any new number forces a fresh preview).

---

## 6. Rollback (if something is wrong after going live)

**Option A: undo the last change (recommended)**
```bash
git revert HEAD          # creates a new commit that undoes the last one
git push origin main     # redeploys the previous version automatically
```

**Option B: redeploy an older version without touching code**
- **Actions → pick the last ✅ run that was good → Re-run all jobs.**
- Re-running builds that run's original commit and publishes it again.

**Option C: take the site offline temporarily**
- **Settings → Pages → Unpublish site** (or disable the workflow under Actions). Re-enable later by running the workflow again.

---

## 7. Custom domain (e.g. `yashwedsayushi.in`)

The steps below use `yashwedsayushi.in` as the example. Replace it with your real domain everywhere.

### 7.1 Buy the domain
Any registrar works: GoDaddy, Hostinger, Namecheap, Cloudflare, BigRock and others. A `.in` or `.com` domain costs roughly ₹500–1,200 for the first year. Make sure you can edit **DNS records** in the registrar's dashboard.

Decide which address guests will use:
- **Apex:** `yashwedsayushi.in`
- **www:** `www.yashwedsayushi.in`
- **Subdomain of a domain you already own:** e.g. `wedding.yourname.com`

Setting up both the apex and `www` (below) is best, because GitHub redirects one to the other automatically.

### 7.2 Verify the domain with GitHub first (prevents domain takeover)
1. GitHub → your **profile picture → Settings → Pages → Add a domain** → enter `yashwedsayushi.in`.
2. GitHub shows a **TXT record**, like this:

   | Type | Name / Host | Value |
   |---|---|---|
   | TXT | `_github-pages-challenge-YashWonder3` | *(the code GitHub shows)* |

3. Add it at your registrar, wait a few minutes, then click **Verify**.

### 7.3 Add the DNS records at your registrar
First **delete any existing "parking", "forwarding" or default `A` / `CNAME` records** for `@` and `www`. They conflict with GitHub's records.

**Apex (`@`), all four of each:**

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 1 hour / Auto |
| A | `@` | `185.199.109.153` | 1 hour / Auto |
| A | `@` | `185.199.110.153` | 1 hour / Auto |
| A | `@` | `185.199.111.153` | 1 hour / Auto |
| AAAA | `@` | `2606:50c0:8000::153` | 1 hour / Auto |
| AAAA | `@` | `2606:50c0:8001::153` | 1 hour / Auto |
| AAAA | `@` | `2606:50c0:8002::153` | 1 hour / Auto |
| AAAA | `@` | `2606:50c0:8003::153` | 1 hour / Auto |

**www:**

| Type | Name / Host | Value |
|---|---|---|
| CNAME | `www` | `yashwonder3.github.io` |

Important:
- The CNAME value is **only** `yashwonder3.github.io`, **without** `/yash-ayushi-wedding-card`.
- **Do not** add a wildcard record (`*`). Wildcards allow subdomain takeover.
- **Cloudflare users:** set these records to **DNS only (grey cloud)** until GitHub has issued the HTTPS certificate.
- If your registrar has **CAA** records, keep one that allows `letsencrypt.org` (or have no CAA records at all).

**Subdomain instead** (e.g. `wedding.yourname.com`): only one record, `CNAME  wedding  →  yashwonder3.github.io`.

### 7.4 Check DNS has spread (minutes to a few hours)
```bash
dig +short yashwedsayushi.in          # should list the four 185.199.x.153 addresses
dig +short www.yashwedsayushi.in      # should show yashwonder3.github.io. then the same addresses
```
You can also use https://dnschecker.org.

### 7.5 Connect the domain to the repository
1. **Repo → Settings → Pages → Custom domain** → type `yashwedsayushi.in` → **Save**.
2. Wait for **"DNS check successful"**.
3. Tick **Enforce HTTPS**.
   - The free certificate can take **up to 24 hours** (usually under an hour).
   - If the box is greyed out, wait and refresh. Don't remove and re-add the domain repeatedly.

You don't need a `CNAME` file in the repository. With GitHub Actions deployments, the domain lives in **Settings → Pages**.

### 7.6 Redeploy so every link uses the new domain
**Actions → "Deploy to GitHub Pages" → Run workflow** (or push any commit).

The workflow picks up the new address automatically. The page, the WhatsApp preview image and all assets now use `https://yashwedsayushi.in/`.

Then:
- [ ] Open `https://yashwedsayushi.in`: it shows the padlock 🔒 and the card.
- [ ] Open `http://yashwedsayushi.in` and `https://www.yashwedsayushi.in`: both redirect to the main address.
- [ ] The old `yashwonder3.github.io/yash-ayushi-wedding-card/` link redirects to the new domain, so links already sent keep working.
- [ ] Paste the new link into WhatsApp to check the preview.
- [ ] Update Formspree's allowed domain (§8).

### 7.7 Renewal
Turn on **auto-renew** at the registrar. If the domain expires, the card goes offline and someone else could buy the name.

---

## 8. Formspree (blessings) in production

1. Log in at **formspree.io** with the account that owns form **`moejbqlb`**.
2. **Settings → Email notifications:** confirm the email address that receives blessings.
3. **Settings → Restrict to domain** *(recommended, if your Formspree plan offers it)*: enter your live domain, `yashwonder3.github.io` (or `yashwedsayushi.in` once that's live). This stops other sites from posting into your form.
   - Update it whenever the domain changes, or blessings from the card will be rejected.
4. Keep **reCAPTCHA off**. The card sends blessings in the background so guests stay on the page, and reCAPTCHA would block that.
5. Check the free-plan monthly submission limit on your plan page. Before the wedding, **Submissions → Export (CSV)** now and then so nothing is lost.
6. Do one real test from the live site after every domain change.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Actions run fails at **"Check the build before publishing"** | a file is missing, or a test address is in the page | Read the red `::error::` line. Fix it locally, run §3.4, then push again. Production is unchanged meanwhile. |
| Actions run fails at **Build** | YAML typo in `story.yaml` | Run the `ruby -ryaml …` check from §3.1. |
| "Get Pages site failed" / 404 right after setup | Pages source not set to Actions | §2 step 2. |
| Deploy waits for approval / is blocked | environment rule doesn't allow `main` | §2 step 4. |
| Live page unstyled, or images missing | old commit built before the auto-address fix, or custom domain changed without a redeploy | Run the workflow again (§7.6). |
| Custom domain: "DNS check unsuccessful" | records not spread yet, or conflicting parking records | Wait, check `dig` (§7.4), and remove old records. |
| "Enforce HTTPS" greyed out | certificate still being issued | Wait up to 24 h. On Cloudflare, use DNS only. |
| Film plays without sound | phone on silent, or old cached video | Turn up the volume / unmute, then refresh. Re-run `make music` if you changed the song. |
| WhatsApp shows an old or no preview | WhatsApp cache | Paste the link with `?v=3`. Make sure `og-image.png` exists (§4 safety gate). |
| Blessings not arriving | Formspree domain restriction, or wrong account | §8 steps 1–3. Check Spam. |
| `story.yaml` changes "disappeared" | editor saved an older copy over it | Reload the file from disk, redo the edit, then commit. |

---

## 10. Optional hardening

- **Keep the card out of Google search:** it contains family names. If you only want people with the link to find it, add `<meta name="robots" content="noindex">` to `layouts/index.html`. Ask Claude, or add it under the `<title>` line.
- **Updating Hugo later:** change `hugo-version` in `.github/workflows/deploy.yml` **and** update Hugo on your Mac to the same version. Test locally (§3.3) before pushing.
- **Big media:** keep each file well under GitHub's 100 MB limit (the film is about 1.4 MB). Don't commit raw videos or songs; keep them in `assets-src/`.

---

## 11. Quick reference

```bash
make serve        # LOCAL TEST on the Mac (http://localhost:1313/), ribbon + simulated blessings
make phone        # LOCAL TEST on your phone (same Wi-Fi), prints the address
make check        # PRODUCTION build + safety checks (run before pushing)
make preview      # regenerate preview.html + film/story.js
make og           # regenerate WhatsApp preview image
make film         # re-render the film (keeps the song)
make music        # change/add the film's song only
make deploy       # build check + commit + push (triggers GitHub Pages)
git revert HEAD && git push origin main   # roll back the last change
```
