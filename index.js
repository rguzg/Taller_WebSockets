const express = require('express');
const app = express();
const ws = require('ws');
const http = require('http');
const database = require('./database');

const server = http.createServer(app);
const socket_server = new ws.Server({server: server});

socket_server.on('connection', (socket) => {
    socket.on('message', (message) => {
        let parsed_message = JSON.parse(message);

        console.log("Se recibió mensaje de: " + parsed_message.username + " el mensaje es: " + parsed_message.message);

        socket_server.clients.forEach((client) => {
            client.send(message);
        })
    });
});

app.use('/static', express.static('Static'));
app.use(express.json());

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));
app.get('/chat', (req, res) => res.sendFile(`${__dirname}/Templates/chat.html`));

app.get('/connected', (req, res) => {
    let connected_users = Object.keys(database.usuarios).filter((user) => database.usuarios[user].connected);

    console.log(connected_users);
});

app.post('/login', (req, res) => {
    let {username, color} = req.body;

    if(username && color){
        if(Object.keys(database.usuarios).includes(username)){
            return res.status(400).json({'status': 400, 'message': 'Ya existe un usuario con este nombre'});
        }

        database.usuarios[username] = {
            username,
            // username: username
            color,
            connected: true,
        }

        console.log(database);
        
        return res.status(200).json({'status': 200, 'message': 'Todo salió bien'});
    }

    // let username = req.body['username'];
    // let color = req.body['color'];
});

server.listen(process.env.PORT || 3000, () => {
    console.log('The server is running!');
});