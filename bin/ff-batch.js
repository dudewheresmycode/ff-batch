#!/usr/bin/env node
const path = require('path');
const chalk = require('chalk')
const { program } = require('commander');
const FFBatch = require('../');
const ConsoleOutput = require('../lib/console');

program
  .option('-d, --deinterlace', 'Apply deinterlacing (yadif)')
  .option('-s, --seek <seconds>', 'Seek', parseFloat)
  .requiredOption('-i, --input <input_dir>', 'Input directory')
  .requiredOption('-o, --output <output_dir>', 'Destination directory')
  .option('-p, --preset <type>', 'Transcoding preset (dvd, 540p, 720p, 1080p)', '1080p')
  .parse(process.argv);

(async () => {
  console.log(program.opts());
  try {
    const batch = new FFBatch(program);
    let cli;
    batch.on('ready', () => {
      // console.log('ready!', batch.files);
      cli = new ConsoleOutput(batch.files);
      batch.run();
    });
    batch.on('progress', data => {
      cli.updateProgress(data);
    });
    batch.on('complete', data => {
      cli.markComplete(data);
    });
    batch.on('exit', () => {
      console.log(chalk.green(`All finished!`));
    });

    
  } catch (error) {
    console.log(chalk.red(error));
  }

})();
