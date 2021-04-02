const express = require('express');
const ws = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

const database = require('./database');

const app = express();
const server = http.createServer(app);
const socket_server = new ws.Server({clientTracking: true, noServer: true});
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

// Retorna true si el nombre de usuario está abandonado. Un nombre de usuario se considera abandonado si su
// last_connected es nulo o si su ultima conexión fue hace más de una hora
const IsUsernameAbandoned = (username) => {
    let user = database.usuarios[username];

    if(user == undefined){
        return true;
    }

    if(user.last_connection == null){
        return true;
    }

    if((Date.now() - user.last_connection === 3600000) && (user.connected === false)){
        return true;
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

app.post('/login', (req, res) => {

    let {username, color} = req.body;
    
    if(username && color){
        // Si ya existe un usuario con el nombre username y el usuario no se encuentra abandonado, se retorna una respuesta 400
        if(Object.keys(database.usuarios).includes(username) && !IsUsernameAbandoned(username)){
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
            last_connection: null,
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

        return res.status(200).json({status: 200, message: Object.keys(database.usuarios)});
    } catch {
        res.status(401).json({status: 401, message: "JWT Invalido"});
    }
});

// Al recibir la petición para conectarse al servidor de WS, primero se revisará la validez del JWT
server.on('upgrade', (req, socket, head) => {
    try{
        let token = req.url.split("token=")[1];
        let decoded_token = jwt.verify(token, secret_key);
        let username = decoded_token.username
        
        // Si no existe el nombre de usuario que menciona el token, se destruye el socket
        if(!database.usuarios[username]){
            throw new Error();
        }

        // Si el token enviado por el usuario, no es token actual asignado a ese usuario, se destruye el socket
        if(database.usuarios[username].current_token != token){
            throw new Error();
        }

        req.user = username;

        // Si el token es valido, se actualiza el estado de conexión del usuario
        database.usuarios[username].last_connection = Date.now();
        database.usuarios[username].connected = true;
    } catch (error) {
        // Si el JWT es invalido, se destruye el socket
        socket.destroy();
        return;
    }

    // Si el JWT es valido, se continua con la conexión al servidor de WS
    socket_server.handleUpgrade(req, socket, head, (socket, req)=> {
        socket_server.emit('connection', socket, req);
    });
})

socket_server.on('connection', (ws, request) => {  
    map.set(ws, request.user);

    // Al recibir un mensaje, reenviar el mensaje a todos los clientes conectados
    ws.on('message', (message) => {
        parsed_message = JSON.parse(message);
        console.log(`Received message ${parsed_message.message} from: ${parsed_message.username}`);
        socket_server.clients.forEach((client) => {
            client.send(message);
        });
    });

    ws.on('close', () => {
        let disconnected_user = map.get(ws);
        console.log(`${disconnected_user} se desconectó del chat`);
    });

    ws.on('error', (error) => {
        console.log(error);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('The server is running!');
});
