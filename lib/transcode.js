const { exec, spawn } = require('child_process');
const { copyFile } = require('fs');
const path = require('path');
const ffmpegBinaryPath = require('ffmpeg-static');
const readline = require('readline');

console.log(ffmpegBinaryPath);

const FFMPEG_MATCH = /frame=\s*(\d+)\s*fps=\s*(\d+)\s*q=([\d\.]+)\s*size=\s*([\w]+)\s*time=([\d\:\.]+)\s*bitrate=\s*([\w\.\/]+)\s*speed=([\d\.]+)x\s*/i;

function probeInput(inputFile, offset = 0) {
  return new Promise((resolve, reject) => {
    // -show_streams
    exec(`ffprobe -v quiet -print_format json -show_format "${inputFile}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const info = JSON.parse(stdout);
        resolve({
          duration: parseFloat(info.format.duration - offset),
          size: parseInt(info.format.size)
        });
      } catch(error) {
        reject(error);
      }
    });
  });
}

function parseTranscoderOutput(raw) {
  const match = raw.match(FFMPEG_MATCH);
  if (match) {
    const [
      _,
      frame,
      fps,
      q,
      size,
      time,
      bitrate,
      speed
    ] = match;
    const [hours, minutes, seconds] = time.split(':');
    const timeSeconds = (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseFloat(seconds);
    return {
      frame,
      fps,
      q,
      size,
      timeSeconds,
      time,
      bitrate,
      speed: parseFloat(speed)
    };
  }
}

function addFilter(params, filter) {
  const clone = [ ...params ];
  const filterPos = clone.indexOf('-vf');
  if (filterPos > -1) {
    clone[filterPos+1] = clone[filterPos+1] + `,${filter}`
  } else {
    clone.push('-vf', 'yadif=1');
  }
  return clone;
}

async function transcode(
  job,
  options
) {
  const {
    deinterlace,
    preset,
    seek,
    onProgress
  } = options;

  const { input, name, output } = job;
  const mediaInfo = await probeInput(input, seek);
  let progressData = {
    name,
    timeSeconds: 0,
    speed: 0,
    size: 0,
    duration: mediaInfo.duration
  };

  if (onProgress) {
    onProgress(progressData);
  }
  
  return new Promise((resolve, reject) => {
    let params = [
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a:0',
      '-map', '0:s:0',
      // '-map', '0:a:m:language:eng', // grab english audio
      // '-map', '0:s:m:language:eng', // grab english subs
      // '-t', 10,
      ...(seek ? ['-ss', seek] : []),
      '-metadata', `title=${name}`,
      '-c:s', 'copy',
      ...preset,
      '-y'
    ];

    if (deinterlace) {
      params = addFilter(params, 'yadif');
    }

    const ffmpeg = spawn(ffmpegBinaryPath, [...params, output]);
    const rl = readline.createInterface({
      input: ffmpeg.stderr
    });
    let raw = [];
    rl.on('line', (lineData) => {
      raw.push(lineData);
      const transcoderData = parseTranscoderOutput(lineData) || {};
      progressData = {
        ...progressData,
        ...transcoderData
      };
    if (onProgress) {
        onProgress(progressData)
      }
    });

    ffmpeg.on('exit', exitCode => {
      if (exitCode !== 0) {
        reject(raw.slice(-5).join('\n'));
      } else {
        resolve();
      }
    });
  });
}

module.exports = transcode;