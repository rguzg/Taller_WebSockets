const express = require('express');
const ws = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const socket_server = new ws.Server({clientTracking: false, noServer: true});

app.use('/static', express.static('Static'));

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));
app.get('/chat', (req, res) => res.sendFile(`${__dirname}/Templates/chat.html`));

server.on('upgrade', (req, socket, head) => {
    socket_server.handleUpgrade(req, socket, head, (socket, req)=> {
        socket_server.emit('connection', socket, req);
    });
})

socket_server.on('connection', (ws, request) => {  
    ws.on('message', (message) => {
      console.log(`Received message ${message}`);
      ws.send(message);
    });
  
    ws.send('¡Feliz Navidad! 🎄')
  });

server.listen(process.env.PORT || 3000, () => {
    console.log('The server is running!');
});
