function request(path, options = {}) {
  return fetch(path, options).then(res => res.json());
}

function form2JSON(form) {
  const data = new FormData(form);
  const object = {};
  data.forEach(function(value, key){
    if (key === 'deinterlace') {
      object[key] = value === '1';
    } else if (key === 'seek') {
      object[key] = parseFloat(value);
    } else {
      object[key] = value;
    }
  });
  return object;
}

let statusTimer;

function updateStatus() {
  clearTimeout(statusTimer);
  const queue = document.querySelector('#queue');
  const statusText = document.querySelector('#status_text');
  request('/status').then(data => {
    console.log(data);
    statusText.innerHTML = data.active ? 'Active' : 'Inactive';

    queue.innerHTML = '';
    data.queue.forEach(item => {
      const node = document.createElement('div');
      node.className = `queue-item queue-item-${item.state}`;
      // state
      const state = document.createElement('div');
      state.append(document.createTextNode(item.state));
      
      // progress
      const progress = document.createElement('div');
      progress.className = 'queue-progress';
      const progressBar = document.createElement('div');
      progressBar.className = 'queue-progress-bar';
      progress.append(progressBar);
      const percent = item.progress * 100;
      progressBar.style.width = `${percent.toFixed(2)}%`;

      // filename
      const filename = document.createElement('div');
      filename.append(document.createTextNode(item.name));
      console.log(filename);
      node.append(state, progress, filename);
      queue.append(node);
    });
    statusTimer = setTimeout(updateStatus, 5000);
  });
}

(() => {
  const form = document.querySelector('#jobform');
  const statusPage = document.querySelector('#status_page');

  updateStatus();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const payload = form2JSON(form);
    const body = JSON.stringify(payload);
    console.log('submit!', body);
    request('/create', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log(response);
    });
  });

})();