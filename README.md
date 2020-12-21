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

- `dvd` (480p, h.264 768K, 160K aac stereo)
- `720p` (720p, h.264 1.8M, 192K aac stereo)
- `1080p` (1080p, h.264 3.5M, 192K aac stereo)
