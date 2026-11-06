# Invite video

A short portrait video (1080×1920) with the card's main details and a song, made to download and send on WhatsApp. It covers the blessing, the couple, both families, the schedule, the venue and the link to the full card. Our story stays in the card and in `film/`.

**The finished file:** `video/output/yash-weds-ayushi-invite.mp4`

| You want to… | Run | Takes |
|---|---|---|
| change any details (edit `data/story.yaml` first) | `make invite` | a few minutes |
| change the song or where it starts | `make invite-music` | a few seconds |

## Changing the song

1. Put the song in `video/audio/` (mp3, m4a or wav).
2. In `data/story.yaml`, set the file and the point to start from:
   ```yaml
   invite_video:
     music: "video/audio/my song.mp3"
     music_start: "0:40"     # minutes:seconds
   ```
3. Run `make invite-music`.

The song fades in and out by itself, and repeats if it is shorter than the video. Leave `music` empty for a silent video.

To try a song without editing the file:

```bash
node video/music.mjs --song "video/audio/my song.mp3" --start 0:40
```

## Sending it

Send the file from WhatsApp as a video. WhatsApp's limit is about 16 MB for this, and the script prints the size and warns if it goes over. WhatsApp compresses videos, so send it as a Document if you want full quality.

The video can't be changed once it's been sent, so check the names, dates and times before sharing it, and re-render after any change to `story.yaml`.

## Good to know

- Songs in `video/audio/` and the finished video stay on this computer. They aren't committed or published on the site.
- `node video/render.mjs --stills` writes one picture per scene to `video/.cache/stills/` for a quick check.
- Open `video/invite.html` in a browser after one render to watch it without sound.
- The tools are shared with `film/`, so no separate install is needed.
