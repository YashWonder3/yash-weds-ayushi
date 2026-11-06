// Renders invite.html → video/output/yash-weds-ayushi-invite.mp4 using the details in data/story.yaml,
// then adds the song (music.mjs). Uses the tools already installed in film/. Usage: node render.mjs [--stills]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const require = createRequire(path.join(root, 'film', 'package.json'));
const yaml = require('js-yaml'), puppeteer = require('puppeteer-core'), ffmpegPath = require('ffmpeg-static');

const FPS = 30;
const stillsOnly = process.argv.includes('--stills');
const cache = path.join(here, '.cache');
const silent = path.join(cache, 'invite-silent.mp4');
mkdirSync(cache, { recursive: true });

// 1. story.yaml + the live guest link → .cache/story.js (invite.html reads these)
const story = yaml.load(readFileSync(path.join(root, 'data', 'story.yaml'), 'utf8'));
const baseURL = readFileSync(path.join(root, 'config', 'production', 'hugo.toml'), 'utf8').match(/^baseURL\s*=\s*"([^"]+)"/m)[1];
const link = baseURL.replace(/^https?:\/\//, '').replace(/\/$/, '');
writeFileSync(path.join(cache, 'story.js'), `window.STORY = ${JSON.stringify(story)};\nwindow.INVITE_LINK = ${JSON.stringify(link)};\n`);

// 2. load the page headless, wait for fonts
const SHELL = path.join(root, 'film', '.browsers/chrome-headless-shell/mac-131.0.6778.204/chrome-headless-shell-mac-x64/chrome-headless-shell');
const CHROME = process.env.CHROME_PATH || (existsSync(SHELL) ? SHELL : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
page.on('pageerror', e => { console.error(e); process.exit(1); });
await page.setViewport({ width: 1080, height: 1920 });
await page.goto(pathToFileURL(path.join(here, 'invite.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  for (const f of ['500 32px "Cormorant Garamond"', '700 32px "Cormorant Garamond"', '400 16px Lora', '700 16px Lora', 'italic 600 16px Lora', '16px "Tiro Devanagari Hindi"'])
    await document.fonts.load(f, 'Aaक');
  await document.fonts.ready;
});
const { duration, keyframes } = await page.evaluate(() => ({ duration: window.INVITE.DURATION, keyframes: window.INVITE.keyframes }));
const shot = (t) => page.evaluate(t => window.INVITE.draw(t), t).then(() => page.screenshot({ type: 'jpeg', quality: 95 }));

if (stillsOnly) {
  const dir = path.join(cache, 'stills');
  mkdirSync(dir, { recursive: true });
  for (const [i, t] of [0, ...keyframes].entries()) writeFileSync(path.join(dir, `still-${i}.jpg`), await shot(t));
  await browser.close();
  console.log(`stills written to ${path.relative(root, dir)}/`);
  process.exit(0);
}

// 3. step through every frame and pipe it into ffmpeg
const ff = spawn(process.env.FFMPEG_PATH || ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(duration * FPS);
for (let i = 0; i < total; i++) {
  if (!ff.stdin.write(await shot(i / FPS))) await new Promise(r => ff.stdin.once('drain', r));
  if (i % FPS === 0) process.stdout.write(`\rrendering ${i / FPS}s / ${duration}s`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
await browser.close();
console.log('\nvideo rendered, adding the song…');

const r = spawnSync(process.execPath, [path.join(here, 'music.mjs')], { stdio: 'inherit' });
process.exit(r.status ?? 1);
