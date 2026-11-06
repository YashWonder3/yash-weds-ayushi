// Adds the song from data/story.yaml (invite_video.music) to the invite video, without re-rendering it.
// To try a song without editing story.yaml: node music.mjs --song "video/audio/my song.mp3" --start 0:40
import { readFileSync, existsSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const require = createRequire(path.join(root, 'film', 'package.json'));
const yaml = require('js-yaml'), ffmpegPath = require('ffmpeg-static');
const ffmpeg = process.env.FFMPEG_PATH || ffmpegPath;

const silent = path.join(here, '.cache', 'invite-silent.mp4');
const out = path.join(here, 'output', 'yash-weds-ayushi-invite.mp4');
const rel = path.relative(root, out);
if (!existsSync(silent)) { console.error('No rendered video yet: run `make invite` first.'); process.exit(1); }
mkdirSync(path.dirname(out), { recursive: true });

const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const cfg = yaml.load(readFileSync(path.join(root, 'data', 'story.yaml'), 'utf8')).invite_video || {};
const music = arg('--song') ?? cfg.music;
const startAt = arg('--start') ?? cfg.music_start;

const report = () => {
  const mb = statSync(out).size / 1048576;
  console.log(`size: ${mb.toFixed(1)} MB${mb > 16 ? ' (over WhatsApp\'s 16 MB video limit: send it as a Document instead)' : ''}`);
};
if (!music) {
  copyFileSync(silent, out);
  console.log(`No invite_video.music in data/story.yaml: the video is silent.\ndone → ${rel}`);
  report();
  process.exit(0);
}
const song = path.resolve(root, music);
if (!existsSync(song)) { console.error(`Song not found: ${music} (paths are from the project folder)`); process.exit(1); }

// the video's length, read from ffmpeg's own report
const info = spawnSync(ffmpeg, ['-hide_banner', '-i', silent], { encoding: 'utf8' }).stderr;
const [, hh, mm, ss] = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
const DURATION = Number(hh) * 3600 + Number(mm) * 60 + Number(ss);

// "1:05" or 65 → seconds
const toSec = (v) => String(v ?? 0).split(':').reduce((a, n) => a * 60 + Number(n), 0);
const start = toSec(startAt);
const FADE_IN = 1.5, FADE_OUT = 3;
// a song shorter than the video simply repeats
const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error',
  '-i', silent, '-stream_loop', '-1', '-i', song,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-af', `atrim=start=${start},asetpts=PTS-STARTPTS,afade=t=in:d=${FADE_IN},afade=t=out:st=${DURATION - FADE_OUT}:d=${FADE_OUT},volume=0.9`,
  '-c:a', 'aac', '-b:a', '160k', '-t', String(DURATION), '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);
console.log(`done → ${rel} with "${path.basename(song)}" from ${start}s`);
report();
