const fs = require('fs');
const path = require('path');
const { isVideoFile, sleep } = require('./lib/utils');
const { ALLOWED_EXTENSIONS, LEFT_PAD } = require('./lib/constants');
const transcode = require('./lib/transcode');
const presets = require('./lib/presets');
const { EventEmitter } = require('events');

class FFBatch extends EventEmitter {
  constructor(
    options = {
      deinterlace: false,
      input: undefined,
      output: undefined,
      preset: '1080p',
      seek: undefined
    }
  ) {
    super();
    this.input = options.input;
    this.output = options.output;
    this.preset = presets[options.preset];
    if (!this.preset) {
      throw Error(`Unkown preset: ${options.preset}`);
    }
    this.files = [];

    this.scanInput()
      .then(() => {
        this.emit('ready', this.files);
      });
      // .catch((error) => {
      //   this.emit('error', error);
      // });
  }
  
  createJob(filepath, isDirectory) {
    const { name } = path.parse(filepath);
    const deinterlace = name.includes('[d]');
    return {
      name,
      deinterlace,
      input: isDirectory ? path.join(this.input, filepath) : filepath,
      output: path.join(this.output, `${name} [${this.preset}].mkv`)
    }
  }

  async scanInput() {
    const stats = await fs.promises.stat(this.input);
    if (stats.isDirectory()) {
      const files = await fs.promises.readdir(this.input);
      // TODO: Add other video extensions?
      this.files = files
        .filter(file => isVideoFile(file) && !/^(_|\.)/.test(file))
        .sort()
        .map(file => this.createJob(file, true));
    } else if (stats.isFile() && isVideoFile(this.input)) {
      this.files = [this.createJob(this.input, false)];
    }
    if (!this.files.length) {
      throw Error(`Input must be a video file or directory containing video files (${program.input})`);
    }
  }

  async run() {

    for (const [index, job] of this.files.entries()) {

      // await transcode(job, {
      //   preset,
      //   deinterlace: job.deinterlace || !!program.deinterlace,
      //   seek: program.seek,
      //   onProgress: (data) => cli.updateProgress({ ...data, index })
      // });

      this.emit('progress', { index, duration: 30, timeSeconds: 4, speed: 1.3 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 6, speed: 1.2 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 10, speed: 1.1 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 15, speed: 1.3 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 20, speed: 1.4 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 25, speed: 1.3 });
      await sleep(500);
      this.emit('progress', { index, duration: 30, timeSeconds: 30, speed: 1.2 });
      await sleep(500);
      this.emit('complete', { ...job, index });


    }
    this.emit('exit');

  }


}

module.exports = FFBatch;