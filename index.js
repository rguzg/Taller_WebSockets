const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const io = require("socket.io");

const database = require('./database');

const app = express();
const server = http.createServer(app);
const socket_server = io(server, {
    port: 3000,
    serveClient: false
});

const secret_key = "e61f65d5-70b0-4271-bb28-87e0f3430b69";

// Retorna true si text es un string que representa un color en formato hexadecimal
const IsHexColor = (text) => {
    let split_text = text.split("#");
    
    // Si la longitud es diferente de dos, entonces el color no esta en el formato correcto: #aaaaaa
    if(split_text.length == 2){
        let color = parseInt(split_text[1], 16);

        return (color <= 16777215); // 16777215 es ffffff en hexadecimal
    }

    return false;
}

// Este map será utilizado para asociar a los WS con el usuario al que les corresponde
let map = new Map();

/* Middleware */
app.use(express.json()); // Parsear los request bodies que sean application/json para que puedan ser leidos por req.body
app.use('/static', express.static('Static')); // Servir archivos estáticos que se encuentren en el folder /Static 

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));
app.get('/chat', (req, res) => res.sendFile(`${__dirname}/Templates/chat.html`));

// Retorna un JWT si elnombre de usuario y color son validos
app.post('/login', (req, res) => {

    let {username, color} = req.body;
    
    if(username && color){
        // Si ya existe un usuario con el nombre username y el usuario se encuentra conectado, se retorna una respuesta 400
        if(Object.keys(database.usuarios).includes(username) && database.usuarios[username].connected){
            return res.status(400).json({'status': 400, 'message': 'Ya existe un usuario con ese nombre'});
        }
        
        // Si el valor de color no es un color en formato hexadecimal, se retorna una respuesta 400
        if(!IsHexColor(color)){
            return res.status(400).json({'status': 400, 'message': 'El valor de color debe ser en formato hexadecimal'});
        }

        // Si el usuario y color son validos, se genera un JWT, se almacena la información en la base de datos, y 
        // se retorna una respuesta 200
        
        let token = jwt.sign({
            username,
            color
        }, secret_key);

        database.usuarios[username] = {
            username,
            color,
            connected: false,
            current_token: token
        };
        
        return res.status(200).json({'status': 200, 'message': {token}});
    }
    
    // Si el formato del body de la petición no es el correcto, se retorna una respuesta 400
    return res.status(400).json({'status': 400, 'message': 'El formato de la petición es incorrecto. Debe incluir los parametros username y color'});
});

// Enviar los usernames de las personas actualmente conectadas al chat
app.get('/connected', (req, res)=> {
    try{
        let token = req.headers.authorization.split('Bearer ')[1];
        jwt.verify(token, secret_key);

        let connected_users = Object.keys(database.usuarios).filter((user) => database.usuarios[user].connected);

        return res.status(200).json({status: 200, message: connected_users});
    } catch {
        res.status(401).json({status: 401, message: "JWT Invalido"});
    }
});

// Al recibir la petición para conectarse al servidor de WS, primero se revisará la validez del JWT utilizando un middleware
socket_server.use((socket, next) => {
    try{
        let token = socket.handshake.auth.token;
        let decoded_token = jwt.verify(token, secret_key);
        let username = decoded_token.username;
        
        // Si no existe el nombre de usuario que menciona el token, se destruye el socket
        if(!database.usuarios[username]){
            throw new Error();
        }

        // Si el token no es el mismo que está almacenado en la BD, se destruye el socket
        if(database.usuarios[username].current_token != token){
            throw new Error();
        }

        // Si el token es valido, se actualiza el estado de conexión del usuario
        database.usuarios[username].connected = true;
        
        next();
    } catch (error) {
        // Si se llama a next con un objeto error, el cliente se desconectará del socket
        console.log(error);
        next(error);
    }
});

socket_server.on('connection', (socket) => {
    // Al recibir un mensaje, reenviar el mensaje a todos los clientes conectados
    socket.on('message', (message) => {
        let parsed_message = JSON.parse(message);

        console.log(`Se recibió el mensaje ${parsed_message.message} de: ${parsed_message.username}`);

        socket_server.emit('message', parsed_message);
    });
});

// Aquí se encuentra todo el manejo de los WS después de que se hayan conectado al servidor
// socket_server.on('connection', (ws, request) => {  
//     map.set(ws, request.user);



//     // Al cerrar el WS, se actualizara el estado de conexión del usuario a false
//     ws.on('close', () => {
//         let disconnected_user = map.get(ws);
//         database.usuarios[disconnected_user].connected = false;

//         console.log(`${disconnected_user} se desconectó del chat`);
//     });

//     ws.on('error', (error) => {
//         console.log(error);
//     });
// });

server.listen(process.env.PORT || 3000, () => {
    console.log('The server is running!');
});
