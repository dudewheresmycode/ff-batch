const path = require('path');
const { ALLOWED_EXTENSIONS } = require('./constants');

function hhmmss(seconds) {
  let start = 14;
  let length = 5;
  if (seconds >= 3600) {
    start = 11;
    length = 8;
  }
  return new Date(seconds * 1000).toISOString().substr(11, 8);
}


function isVideoFile(file) {
  return ALLOWED_EXTENSIONS.includes(path.extname(file));
}

function sleep(miliseconds = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds);
  });
}

module.exports = {
  hhmmss,
  isVideoFile,
  sleep
}