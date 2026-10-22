# Yash & Ayushi Wedding Invite - convenience commands
# Usage: make serve | make build | make deploy | make clean | make film | make preview

.PHONY: serve build check clean deploy film preview og music

serve:          ## Local dev server with live reload (http://localhost:1313)
	hugo server -D --disableFastRender --noHTTPCache

build:          ## Build the site (output in ./public)
	hugo --minify

check:          ## Build strictly + clean unused cache (good before pushing)
	hugo --gc --minify

clean:          ## Remove build output and caches
	rm -rf public resources .hugo_build.lock

deploy: check preview   ## Commit all changes and push (GitHub Actions deploys to Pages)
	git add -A
	git commit -m "Update invite" || echo "Nothing to commit"
	git push origin main

film:           ## Re-render static/videos/wedding-film.mp4 from data/story.yaml
	cd film && npm install --silent && ([ -d .browsers ] || npm run browser) && npm run render

preview:        ## Regenerate preview.html + film/story.js from data/story.yaml
	hugo --baseURL / -d .preview-build --quiet
	python3 tools/preview.py .preview-build/index.html preview.html
	rm -rf .preview-build
	cd film && node -e "const y=require('js-yaml'),fs=require('fs');fs.writeFileSync('story.js','window.STORY = '+JSON.stringify(y.load(fs.readFileSync('../data/story.yaml','utf8')),null,2)+';\\n')"

og:             ## Re-render static/images/og-image.png (WhatsApp preview card) from data/story.yaml
	cd film && npm install --silent && ([ -d .browsers ] || npm run browser) && node og.mjs

music:          ## Add/replace the song in the film (film.music in data/story.yaml) — no re-render needed
	cd film && npm install --silent && node music.mjs
