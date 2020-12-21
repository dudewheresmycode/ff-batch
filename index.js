const fs = require('fs');
const path = require('path');
const { isVideoFile, sleep } = require('./lib/utils');
const {
ALLOWED_EXTENSIONS,
  LEFT_PAD,
  DEFAULT_OUTPUT_EXTENSION
} = require('./lib/constants');
const transcode = require('./lib/transcode');
const presets = require('./lib/presets');
const { EventEmitter } = require('events');

class FFBatch extends EventEmitter {
  constructor(
    options = {
      deinterlace: false,
      // input: undefined,
      // output: undefined,
      preset: '1080p',
      // seek: undefined
    }
  ) {
    super();
    this.deinterlace = options.deinterlace || false;

    this.input = options.input;
    if (!this.input) { throw Error('Missing input'); }

    this.output = options.output;
    if (!this.output) { throw Error('Missing output'); }
    
    this.presetName = options.preset;
    this.preset = presets[this.presetName];
    if (!this.preset) {
      throw Error(`Unkown preset: ${this.presetName}`);
    }
    this.outputExtension = this.preset.extension || options.outputExtension || DEFAULT_OUTPUT_EXTENSION;

    this.seek = options.seek;

    this.files = [];

    this.scanInput().then(() => {
      this.emit('ready', this.files);
    });
  }
  
  createJob(filepath, isDirectory) {
    const { name } = path.parse(filepath);
    const deinterlace = name.includes('[d]');
    const suffix = this.presetName ? ` [${this.presetName}]` : '';
    return {
      name,
      deinterlace,
      input: isDirectory ? path.join(this.input, filepath) : filepath,
      output: path.join(this.output, `${name}${suffix}.${this.outputExtension}`)
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

      await transcode(job, {
        preset: this.preset,
        deinterlace: job.deinterlace || this.deinterlace,
        seek: this.seek,
        onProgress: (data) => this.emit('progress', { ...data, index })
      });

      this.emit('complete', { ...job, index });

    }
    this.emit('exit');

  }


}

module.exports = FFBatch;