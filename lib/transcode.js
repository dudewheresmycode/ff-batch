const { exec, spawn } = require('child_process');
const { copyFile } = require('fs');
const path = require('path');
const ffmpegBinaryPath = require('ffmpeg-static');
const readline = require('readline');
const { hhmmssToSeconds } = require('./utils');

console.log(ffmpegBinaryPath);

const DURATION_MATCH = /duration:\s*([\d:\.]+)/gi;
const FFMPEG_MATCH = /frame=\s*(\d+)\s*fps=\s*(\d+)\s*q=([\d\.]+)\s*size=\s*([\w]+)\s*time=([\d\:\.]+)\s*bitrate=\s*([\w\.\/]+)\s*speed=([\d\.]+)x\s*/i;

function parseTranscoderDuration(raw) {
  const durationMatches = raw.matchAll(DURATION_MATCH);
  let seconds;
  for (const match of durationMatches) {
    // console.log(`Found ${match[1]} start=${match.index} end=${match.index + match[0].length}.`);
    if (match[1]) {
      seconds = hhmmssToSeconds(match[1]);
      break;
    }
  }
  return seconds;
}

function parseTranscoderProgress(raw) {
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

  let duration = -1;
  const { input, name, output } = job;
  // const mediaInfo = await probeInput(input, seek);
  let progressData = {
    name,
    timeSeconds: 0,
    speed: 0,
    size: 0,
    duration // mediaInfo.duration
  };

  if (onProgress) {
    onProgress(progressData);
  }
  
  return new Promise((resolve, reject) => {
    let params = [
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a:0',
      '-map', '0:s:0?',
      // '-map', '0:a:m:language:eng', // grab english audio
      // '-map', '0:s:m:language:eng', // grab english subs
      // '-t', 10,
      ...(seek ? ['-ss', seek] : []),
      '-metadata', `title=${name}`,
      '-c:s', 'copy',
      ...preset.options,
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
      if (duration < 0) {
        const durationMatch = parseTranscoderDuration(lineData);
        if (durationMatch) {
          duration = durationMatch;
        }
      }
      const transcoderData = parseTranscoderProgress(lineData) || {};
      progressData = {
        ...progressData,
        ...transcoderData,
        duration
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