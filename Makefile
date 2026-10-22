# Yash & Ayushi Wedding Invite - convenience commands
# Usage: make serve | make build | make deploy | make clean | make film | make preview

.PHONY: serve phone serve-public build check clean deploy film preview og music

serve:          ## LOCAL TEST server with live reload (http://localhost:1313) — test ribbon, simulated blessings
	hugo server -D --disableFastRender --noHTTPCache --environment development

phone:          ## LOCAL TEST server for your phone on the same Wi-Fi (prints the address)
	@IP=$$(ipconfig getifaddr en0 || ipconfig getifaddr en1); echo "Open on your phone: http://$$IP:1515/"; \
	hugo server --bind 0.0.0.0 --port 1515 --baseURL http://$$IP:1515/ --disableFastRender --noHTTPCache --environment development

serve-public:   ## LOCAL TEST of the real built files: builds into ./public, serves it at http://localhost:8080/
	hugo --environment development --baseURL http://localhost:8080/ --cleanDestinationDir -d public --quiet
	@echo "Serving ./public at http://localhost:8080/  (Ctrl+C to stop)"
	python3 -m http.server 8080 --directory public

build:          ## PRODUCTION build into ./public (same as GitHub Actions)
	hugo --gc --minify --environment production

check:          ## PRODUCTION build + the same safety checks GitHub runs (good before pushing)
	rm -rf .prod-build && hugo --gc --minify --environment production -d .prod-build --quiet
	@! grep -qE 'localhost|192\.168\.|YOUR-USERNAME|env-ribbon|data-simulate|LOCAL TEST' .prod-build/index.html || { echo "✗ Production build contains local/test content"; exit 1; }
	@grep -q 'formspree.io/f/' .prod-build/index.html || { echo "✗ Blessings form not connected"; exit 1; }
	@rm -rf .prod-build && echo "✓ Production build is clean"

clean:          ## Remove build output and caches
	rm -rf public resources .hugo_build.lock .prod-build .preview-build

deploy: check preview   ## Commit all changes and push (GitHub Actions deploys to Pages)
	git add -A
	git commit -m "Update invite" || echo "Nothing to commit"
	git push origin main

film:           ## Re-render static/videos/wedding-film.mp4 from data/story.yaml
	cd film && ([ -d node_modules ] || npm install --silent) && ([ -d .browsers ] || npm run browser) && npm run render

preview:        ## Regenerate preview.html + film/story.js from data/story.yaml
	hugo --environment development --baseURL / -d .preview-build --quiet
	python3 tools/preview.py .preview-build/index.html preview.html
	rm -rf .preview-build
	cd film && node -e "const y=require('js-yaml'),fs=require('fs');fs.writeFileSync('story.js','window.STORY = '+JSON.stringify(y.load(fs.readFileSync('../data/story.yaml','utf8')),null,2)+';\\n')"

og:             ## Re-render static/images/og-image.png (WhatsApp preview card) from data/story.yaml
	cd film && ([ -d node_modules ] || npm install --silent) && ([ -d .browsers ] || npm run browser) && node og.mjs

music:          ## Add/replace the song in the film (film.music in data/story.yaml) — no re-render needed
	cd film && ([ -d node_modules ] || npm install --silent) && node music.mjs
