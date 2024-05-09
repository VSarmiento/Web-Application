let ws;

window.onload = function() {
    ws = new WebSocket('ws://10.0.2.15:8080');

    ws.onopen = function() {
        console.log('Connected to the server');
    };

    ws.onmessage = function(event) {
        let data = JSON.parse(event.data);
        if (data.status === 'success') {
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed. Please try again.');
        }
    };
}

function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    ws.send(JSON.stringify({ action: 'Login', username: username, password: password }));
}
