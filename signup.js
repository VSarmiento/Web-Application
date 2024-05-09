document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = event.target.createUsername.value;
  const password = event.target.createPassword.value;
  const ws = new WebSocket('ws://localhost:8080');
  ws.onopen = function() {
      ws.send(JSON.stringify({ action: 'Create', username: username, password: password }));
      window.location.href = "index.html";
  };
});

document.querySelector('.back').addEventListener('click', function() {
  window.location.href = "index.html";
});