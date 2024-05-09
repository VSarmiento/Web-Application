const WebSocket = require('ws');
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('New connection established');

  const saveEntry = (message) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection: ', err);
        return;
      }
      
      connection.query('INSERT INTO journal_entries (entry) VALUES (?)', [message], (err, results) => {
        connection.release();

        if (err) {
          console.error('Error executing MySQL query: ', err);
          return;
        }

        console.log('Journal entry saved:', message);
      });
    });
  };

  ws.on('message', message => {
    console.log('Received message:', message);
    saveEntry(message); 
  });
});
