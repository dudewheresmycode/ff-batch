const chalk = require('chalk')
const { LEFT_PAD } = require('./constants');

function progressBar(progress) {
  const totalChars = LEFT_PAD - 1;
  const units = Math.floor(progress * totalChars);
  const fill = chalk.bgGreen(' '.repeat(units));
  const empty = chalk.bgGrey(' '.repeat(totalChars - units));
  return `${fill}${empty} [ ]`;
}

module.exports = progressBar;