// Renders film.html → static/videos/wedding-film.mp4 (+ poster) using the text in data/story.yaml.
// Run `npm install && npm run browser` once (ffmpeg comes from ffmpeg-static). Usage: node render.mjs [--fps 30] [--stills]
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'static', 'videos');
const args = process.argv.slice(2);
const fps = Number(args[args.indexOf('--fps') + 1]) || 30;
const stillsOnly = args.includes('--stills');
// prefers the headless shell fetched by `npm run browser` (desktop Chrome can hang headless on older macOS)
const SHELL = path.join(here, '.browsers/chrome-headless-shell/mac-131.0.6778.204/chrome-headless-shell-mac-x64/chrome-headless-shell');
const CHROME = process.env.CHROME_PATH || (existsSync(SHELL) ? SHELL : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

// 1. story.yaml → story.js (film.html reads window.STORY)
const story = yaml.load(readFileSync(path.join(root, 'data', 'story.yaml'), 'utf8'));
writeFileSync(path.join(here, 'story.js'), `window.STORY = ${JSON.stringify(story, null, 2)};\n`);
mkdirSync(outDir, { recursive: true });

// 2. load the film headless, wait for fonts
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto(pathToFileURL(path.join(here, 'film.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  for (const f of ['500 32px "Cormorant Garamond"', 'italic 500 32px "Cormorant Garamond"', '600 32px "Cormorant Garamond"', '500 32px "Cormorant Infant"', '400 16px Lora', 'italic 400 16px Lora'])
    await document.fonts.load(f);
});
const frame = (t, type = 'image/jpeg') => page.evaluate((t, type) => {
  window.FILM.draw(t);
  return document.getElementById('film').toDataURL(type, 0.95).split(',')[1];
}, t, type);
const duration = await page.evaluate(() => window.FILM.DURATION);

// poster = the invitation card
writeFileSync(path.join(outDir, 'wedding-film-poster.jpg'), Buffer.from(await frame(29.2), 'base64'));

if (stillsOnly) {
  // contact sheet of key moments for a quick look
  for (const t of [2.6, 7, 9.4, 14.6, 19.6, 21.6, 25.6, 29.2])
    writeFileSync(path.join(here, `still-${String(t).replace('.', '_')}.jpg`), Buffer.from(await frame(t), 'base64'));
  await browser.close();
  console.log('stills written to film/');
  process.exit(0);
}

// 3. step through every frame and pipe it into ffmpeg
const out = path.join(outDir, 'wedding-film.mp4');
const ff = spawn(process.env.FFMPEG_PATH || ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(duration * fps);
for (let i = 0; i < total; i++) {
  const buf = Buffer.from(await frame(i / fps), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\rrendering ${Math.round(i / fps)}s / ${duration}s`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
await browser.close();
console.log(`\ndone → ${path.relative(root, out)}`);

// keep a silent master, then add the song (if film.music is set in story.yaml)
mkdirSync(path.join(here, '.cache'), { recursive: true });
copyFileSync(out, path.join(here, '.cache', 'wedding-film-silent.mp4'));
spawnSync(process.execPath, [path.join(here, 'music.mjs')], { stdio: 'inherit' });
