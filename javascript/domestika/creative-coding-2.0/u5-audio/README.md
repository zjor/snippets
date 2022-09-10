## How to build
`canvas-sketch sketch-concentric.js --name index --build --inline`

## How to process video

1. Convert from `*.mov` to `*.mp4`
```bash
$> ffmpeg -i video.mov -vcodec h264 -acodec aac video-out.mp4
```

2. Cut 15 seconds interval
```bash
$> ffmpeg -i video-out.mp4 -ss 00:00:39 -t 00:00:15 -c:v copy -c:a copy video_cut.mp4
```

## Ideas
1. Share button overlay
2. Publish each sketch as a separate page 
