// Renders static/images/og-image.png (the WhatsApp/link preview card, 1200×630) from data/story.yaml.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const S = yaml.load(readFileSync(path.join(root, 'data', 'story.yaml'), 'utf8'));
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const names = esc(S.couple.display).replace('❤', '<span class="love">❤&#xFE0E;</span>');
// Just the rings + initials: crop off the small date line, the big date sits below.
const logo = readFileSync(path.join(root, 'static', 'images', 'hero-placeholder.svg'), 'utf8').replace(/viewBox="[^"]*"/, 'viewBox="30 66 180 134"');

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Lora&display=swap" rel="stylesheet">
<style>
  body{margin:0;width:1200px;height:630px;background:#FAF5EE;font-family:'Lora',serif;color:#4A342E}
  .f{position:absolute;inset:28px;border:2px solid #C19A5B}.f2{position:absolute;inset:42px;border:1px solid rgba(193,154,91,.6)}
  .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .logo{width:190px;height:141px;margin-bottom:14px}.logo svg{width:100%;height:100%}
  .eb{letter-spacing:.42em;font-size:22px;color:#B4664A;text-transform:uppercase;margin:6px 0 10px}
  h1{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:96px;line-height:1;margin:0}
  .love{color:#7E2A33}
  .d{font-family:'Cormorant Garamond',serif;font-size:44px;color:#7A635B;margin-top:18px}
  .v{font-size:26px;color:#7A635B;margin-top:6px}
</style>
<div class="f"></div><div class="f2"></div>
<div class="c">
  <div class="logo">${logo}</div>
  <div class="eb">The Wedding Of</div>
  <h1>${names}</h1>
  <div class="d">${esc(S.wedding.datesLine)}</div>
  <div class="v">${esc(S.wedding.city)}</div>
</div>`;

const shells = path.join(here, '.browsers', 'chrome-headless-shell');
const find = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? find(path.join(d, e.name)) : e.name === 'chrome-headless-shell' ? [path.join(d, e.name)] : []);
const browser = await puppeteer.launch({ executablePath: find(shells)[0] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'static', 'images', 'og-image.png') });
await browser.close();
console.log('static/images/og-image.png updated');
