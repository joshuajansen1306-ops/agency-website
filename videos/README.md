# Hero video

Put the finished hero film here. The page plays it automatically and does nothing if the files are missing.

| File | Used for | Size | Target weight |
|---|---|---|---|
| `hero.mp4` | desktop and tablet (H.264, 16:9) | 1920 x 1080, 24 fps | 3 MB or less |
| `hero.webm` | same, smaller (VP9), tried first | 1920 x 1080, 24 fps | 2 MB or less |
| `hero-vertical.mp4` | phones, 700 px wide or less (9:16) | 720 x 1280, 24 fps | 2 MB or less |

No audio track. Loop length 12 to 16 seconds.

## Compress from your master (needs ffmpeg)

```
ffmpeg -i master.mov -an -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 25 -preset slow -movflags +faststart hero.mp4
ffmpeg -i master.mov -an -vf "scale=1920:-2,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 36 hero.webm
ffmpeg -i master.mov -an -vf "crop=ih*9/16:ih,scale=720:-2,fps=24" -c:v libx264 -crf 25 -preset slow -movflags +faststart hero-vertical.mp4
```

The page respects "reduce motion" and data-saver settings, pauses when scrolled away, and has a Pause button.
