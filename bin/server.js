const express = require('express');
const FFBatch = require('../');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(`${process.cwd()}/html`));

const DEFAULT_STATUS = {
  active: false,
  ready: false,
  queue: []
};
const DEFAULT_QUEUE_STATE = {
  name: '',
  state: 'unkown',
  progress: 0,
  speed: 0,
  time: 0,
  duration: -1
}

let status = { ...DEFAULT_STATUS };
let batch;

function handleReady(files) {
  status.queue = files.map(file => {
    return {
      ...DEFAULT_QUEUE_STATE,
      ...file,
      state: 'queued'
    };
  });
  status.ready = true;
  batch.run();
}
function handleComplete({ index }) {
  if (status.queue[index]) {
    status.queue[index].progress = 1;
    status.queue[index].state = 'complete';
  }
}
function handleProgress({ duration, index, timeSeconds, speed }) {
  if (status.queue[index]) {
    status.queue[index].state = 'encoding';
    status.queue[index].progress = timeSeconds / duration;
    status.queue[index].speed = speed;
  }
}
function handleExit() {
  status.active = false;
  status.ready = false;
}

app.get('/status', (req, res) => {
  res.json(status);
});

app.post('/create', (req, res) => {
  const options = req.body;
  console.log(options);
  if (!status.active) {
    status = { ...DEFAULT_STATUS, active: true };
    batch = new FFBatch(options);
    batch.on('ready', handleReady);
    batch.on('progress', handleProgress);
    batch.on('complete', handleComplete);
    batch.on('exit', handleExit);
    res.status(201).json({ created: true });
  } else {
    res.status(409).json({ error: 'Job already in progress' });
  }
});

app.listen(HTTP_PORT, () => console.log(`Listening on http://localhost:${HTTP_PORT}`));