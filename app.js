const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./mydb.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Users table created.');
});

db.run(`CREATE TABLE IF NOT EXISTS entries(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  entry TEXT NOT NULL
)`, (err) => {
if (err) {
  console.error(err.message);
}
console.log('Entries table created.');
});


const wss = new WebSocket.Server({ port: 8080 });

// Variable to store the last successful login
let lastSuccessfulLogin = { username: null, password: null };

wss.on('connection', ws => {
  console.log('New connection established');

  ws.on('message', message => {
    const data = JSON.parse(message.toString());
    console.log('Received message:', data);
    if (data.action === 'Create') {
      db.run(`INSERT INTO users(username, password) VALUES(?, ?)`, [data.username, data.password], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`User created with ID: ${this.lastID}`);
      });
    } else if (data.action === 'Login') {
      db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [data.username, data.password], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (row) {
          // Update the last successful login
          lastSuccessfulLogin.username = data.username;
          lastSuccessfulLogin.password = data.password;
          ws.send(JSON.stringify({ status: 'success' }));
        } else {
          ws.send(JSON.stringify({ status: 'failure' }));
        }
      });
    } else if (data.action === 'Save') {
      db.run(`INSERT INTO entries(username, entry) VALUES(?, ?)`, [lastSuccessfulLogin.username, data.entry], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Entry saved for user: ${lastSuccessfulLogin.username}`);
      });
    } else if (data.action === 'Load') {
      db.all(`SELECT entry FROM entries WHERE username = ?`, [lastSuccessfulLogin.username], (err, rows) => {
        if (err) {
          return console.error(err.message);
        }
        const entries = rows.map(row => row.entry);
        ws.send(JSON.stringify({ action: 'Load', entries }));
      });
    }
  });  

  db.each(`SELECT username, password FROM users`, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`User: ${row.username}, Password: ${row.password}`);
  });
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the SQLite database connection.');
    process.exit(0);
  });
});
