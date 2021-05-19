const express = require('express');
const app = express();
const ws = require('ws');
const io = require('socket.io');
const http = require('http');
const database = require('./database');

const server = http.createServer(app);
// const socket_server = new ws.Server({noServer: true});
const socket_server = io(server, {
    port: 3000,
    serveClient: false
});

let map = new Map()

// Utilizando libreria ws
// socket_server.on('connection', (socket) => {
//     socket.on('message', (message) => {
//         let parsed_message = JSON.parse(message);

//         if(! map.has(socket)){
//             map.set(socket, parsed_message.username);
//         }

//         console.log("Se recibió mensaje de: " + parsed_message.username + " el mensaje es: " + parsed_message.message);

//         if(parsed_message['image'] != null){
//             console.log(parsed_message['image'][0]);
//         }

//         socket_server.clients.forEach((client) => {
//             client.send(message);
//         })
//     });

//     socket.on('close', () => {
//         let disconnected_user = map.get(socket);
//         console.log(database);
//         database.usuarios[disconnected_user] = "";
//         console.log(database);
//     });
// });

socket_server.on('connection', (socket) => {
    socket.on('message', (message) => {
        console.log("Entre");

        if(! map.has(socket)){
            map.set(socket, message.username);
        }

        console.log("Se recibió mensaje de: " + message.username + " el mensaje es: " + message.message);

        if(message['image'] != null){
            console.log(message['image'][0]);
        }

        socket_server.emit('message', message);
    });

    socket.on('disconnect', () => {
        let disconnected_user = map.get(socket);
        console.log(database);
        database.usuarios[disconnected_user] = "";
        console.log(database);
    });
});

// server.on('upgrade', (req, socket, head) => {
//     let numbers = req.url.split("number=")[1];

//     if(numbers == 2){
//         socket_server.handleUpgrade(req, socket, head, (socket, req) => {
//             socket_server.emit('connection', socket, req);
//         });
//     } else {
//         socket.destroy();
//     }
// });

socket_server.use((socket, next) => {
    let numbers = socket.handshake.auth.numero;

        if(numbers == 2){
            next();
        } else {
            next(new Error());
        }
});

app.use('/static', express.static('Static'));
app.use(express.json());

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));
app.get('/chat', (req, res) => res.sendFile(`${__dirname}/Templates/chat.html`));

app.get('/connected', (req, res) => {
    // let connected_users = Object.keys(database.usuarios).filter((user) => database.usuarios[user].connected);
    let connected_users = Object.keys(database.usuarios);
    res.status(200).json({'status': 200, 'message': connected_users});
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