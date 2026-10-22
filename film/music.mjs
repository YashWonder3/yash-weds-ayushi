// Adds the song from data/story.yaml (film.music) to the film, without re-rendering it.
// The silent master lives in film/.cache/wedding-film-silent.mp4 (written by render.mjs), so you can
// swap songs or change the start point and run `make music` again as often as you like.
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import ffmpegPath from 'ffmpeg-static';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const film = path.join(root, 'static', 'videos', 'wedding-film.mp4');
const silent = path.join(here, '.cache', 'wedding-film-silent.mp4');
const S = yaml.load(readFileSync(path.join(root, 'data', 'story.yaml'), 'utf8'));
const music = S.film && S.film.music;

if (!existsSync(silent)) { mkdirSync(path.dirname(silent), { recursive: true }); copyFileSync(film, silent); }
if (!music) {
  copyFileSync(silent, film);
  console.log('No film.music in data/story.yaml — the film is silent.');
  process.exit(0);
}
const song = path.resolve(root, music);
if (!existsSync(song)) { console.error(`Song not found: ${music} (paths are from the project folder)`); process.exit(1); }

// "1:05" or 65 → seconds
const toSec = (v) => String(v ?? 0).split(':').reduce((a, n) => a * 60 + Number(n), 0);
const start = toSec(S.film.music_start);
const DURATION = 30, FADE_IN = 1.5, FADE_OUT = 3;
const r = spawnSync(process.env.FFMPEG_PATH || ffmpegPath, ['-y', '-loglevel', 'error',
  '-i', silent, '-ss', String(start), '-i', song,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-af', `afade=t=in:d=${FADE_IN},afade=t=out:st=${DURATION - FADE_OUT}:d=${FADE_OUT},volume=0.9`,
  '-c:a', 'aac', '-b:a', '160k', '-t', String(DURATION), '-movflags', '+faststart', film], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);
console.log(`done → static/videos/wedding-film.mp4 with "${path.basename(song)}" from ${start}s`);
