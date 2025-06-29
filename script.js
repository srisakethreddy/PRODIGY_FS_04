const socket = io();
let currentRoom = '';
let username = '';

function register() {
  username = document.getElementById('username').value;
  if (!username) return alert('Please enter your name.');
  socket.emit('register', username);
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'flex';
}

function joinRoom() {
  currentRoom = document.getElementById('room').value;
  if (!currentRoom) return alert('Enter a room name!');
  socket.emit('join-room', currentRoom);
  document.getElementById('chat-display').innerHTML = '';
}

function sendMessage() {
  const message = document.getElementById('message').value;
  const fileInput = document.getElementById('fileInput');

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send-message', { room: currentRoom, message, file: reader.result });
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    socket.emit('send-message', { room: currentRoom, message, file: null });
  }

  document.getElementById('message').value = '';
  fileInput.value = '';
}

socket.on('receive-message', ({ user, message, file, time }) => {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-message');
  msgDiv.classList.add(user === username ? 'self' : 'other');
  msgDiv.innerHTML = `<strong>${user}</strong>: ${message}<br><small>${time}</small>`;

  if (file) {
    const isImg = file.startsWith('data:image');
    msgDiv.innerHTML += `<br>${isImg ? `<img src="${file}">` : `<a href="${file}" download>Download File</a>`}`;
  }

  document.getElementById('chat-display').appendChild(msgDiv);
  document.getElementById('chat-display').scrollTop = document.getElementById('chat-display').scrollHeight;
});

socket.on('user-list', users => {
  document.getElementById('users').innerHTML = users.map(u => `<div>👤 ${u}</div>`).join('');
});

socket.on('notification', msg => {
  alert(msg);
});

socket.on('chat-history', history => {
  document.getElementById('chat-display').innerHTML = '';
  history.forEach(({ user, message, file, time }) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.classList.add(user === username ? 'self' : 'other');
    msgDiv.innerHTML = `<strong>${user}</strong>: ${message}<br><small>${time}</small>`;
    if (file) {
      const isImg = file.startsWith('data:image');
      msgDiv.innerHTML += `<br>${isImg ? `<img src="${file}">` : `<a href="${file}" download>Download File</a>`}`;
    }
    document.getElementById('chat-display').appendChild(msgDiv);
  });
});