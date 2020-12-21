## ff-batch

A simple, but powerful, tool for batch ffmpeg jobs.

### CLI Interface

Install globally using `npm`:

```bash
npm install -g ff-batch
```

Example: Batch convert all videos in the `input` folder, and save to the `output` folder, using the `720p` preset.

```bash
ff-batch -i /input/folder -o /output/folder -p 720p
```

### HTTP/Web Interface

```bash
git clone https://github.com/dudewheresmycode/ff-batch
cd ff-batch
yarn start
```

> Open http://localhost:8080 in your browser of choice

### Built-in Presets

- `dvd` (480p, h.264 768Kps, 160k aac stereo)
- `720p` (720p, h.264 1.8Mpps, 192k aac stereo)
- `1080p` (1080p, h.264 3.5Mpps, 192k aac stereo)
