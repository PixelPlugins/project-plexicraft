var express = require('express');
var path = require('path');
var SocketServer = require('ws').Server;

const server = express()
  .use((req, res) => res.sendFile(path.join(__dirname, 'index.html')))
  .listen(5000, () => console.log(`Listening on ${ 5000 }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);