const chalk = require('chalk');
const DraftLog = require('draftlog');
const readline = require('readline');
const { LEFT_PAD } = require('./constants');
const {
  clearConsole,
  hhmmss
} = require('./utils');
const progressBar = require('./progressBar');

const SPACES = ' '.repeat(LEFT_PAD);

class ConsoleOutput {

  constructor(items) {
    DraftLog(console);
    this.items = items;

    this.clearConsole();

    console.log();
    console.log(`ff-batch 1.0.0`);
    console.log();

    this.consoleDrafts = this.items.map(job => {
      const draft = console.draft();
      draft(chalk.grey(`${SPACES}[ ] ${job.name}`));
      return draft;
    });    
  }

  clearConsole() {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)  
  }

  print(index, line) {
    this.consoleDrafts[index](line);
  }

  getName(index) {
    const item = this.items[index];
    return item ? item.name : '';
  }

  markComplete({ index }) {
    this.print(index, chalk.green(`${SPACES}[✔] ${this.getName(index)}`));
  }
  
  updateProgress({ duration, index, timeSeconds, speed }) {
    const progress = timeSeconds / duration;
    const bar = progressBar(progress);
    let timeRemain = -1;
    if (speed) {
      timeRemain = (duration - timeSeconds) * (1 / speed);
    }
  
    const strings = {
      progress: `${(progress * 100).toFixed(1)}%`,
      time: hhmmss(timeSeconds),
      duration: hhmmss(duration),
      remain: timeRemain > -1 ? hhmmss(timeRemain) : 'N/A',
      speed: speed.toFixed(1)
    };

    const line = [
      bar,
      this.getName(index).padEnd(48, ' '),
      chalk.green(
        `[${strings.progress}, ${strings.time}/${strings.duration}, speed: ${strings.speed}x, eta: ${strings.remain}]`
      )
    ].join(' ');
    
    this.print(index, line);
  }
 
}

module.exports = ConsoleOutput;