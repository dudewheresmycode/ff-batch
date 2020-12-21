// Various ffmpeg presets

module.exports = {

  //
  // 480p - H.264 1Mbps, AAC 192Kbps stereo
  'dvd': [
    // video
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', 17,
    '-maxrate', '768k',
    '-bufsize', '1536k',
    '-vf', 'scale=-2:480',
    '-preset', 'medium',
    // audio
    '-c:a', 'aac',
    '-ac', 2,
    '-b:a', '160k'
  ],

  //
  // 720p - H.264 2.5Mbps, AAC 192Kbps stereo
  '720p': [
    // video
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', 17,
    '-maxrate', '1800k',
    '-bufsize', '3600k',
    '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease',
    '-preset', 'slow',
    // audio
    '-c:a', 'aac',
    '-ac', 2,
    '-b:a', '192k'
  ],

  //
  // 1080p - H.264 3.2Mbps, AAC 256Kbps stereo
  '1080p': [
    // video
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', 17,
    '-maxrate', '3500k',
    '-bufsize', '7000k',
    // '-vf', 'scale=w=1920:h=1080:force_original_aspect_ratio=decrease',
    '-preset', 'slow',
    // audio
    '-c:a', 'aac',
    '-ac', 2,
    '-b:a', '192k'
  ]
}