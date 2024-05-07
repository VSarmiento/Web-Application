const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('New connection made');
  ws.on('message', message => {
    console.log('Received: %s', message);
  });
});


wss.onopen = () => {
  console.log('WebSocket is connected');
};