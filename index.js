const express = require('express');
const ws = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

const database = require('./database');

const app = express();
const server = http.createServer(app);
const socket_server = new ws.Server({clientTracking: false, noServer: true});
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

/* Middleware */
app.use(express.json()); // Parsear los request bodies que sean application/json para que puedan ser leidos por req.body
app.use('/static', express.static('Static')); // Servir archivos estáticos que se encuentren en el folder /Static 

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));
app.get('/chat', (req, res) => res.sendFile(`${__dirname}/Templates/chat.html`));

app.post('/login', (req, res) => {

    let {username, color} = req.body;
    
    if(username && color){
        // Si ya existe un usuario con el nombre username, se retorna una respuesta 400
        if(Object.keys(database.usuarios).includes(username)){
            return res.status(400).json({'status': 400, 'message': 'Ya existe un usuario con ese nombre'});
        }
        
        // Si el valor de color no es un color en formato hexadecimal, se retorna una respuesta 400
        if(!IsHexColor(color)){
            return res.status(400).json({'status': 400, 'message': 'El valor de color debe ser en formato hexadecimal'});
        }

        // Si el usuario y color son validos, se almacena la información en la base de datos, se genera un JWT y 
        // se retorna una respuesta 200
        database.usuarios[username] = {
            username,
            color,
            connected: false
        };

        let token = jwt.sign({
            username,
            color
        }, secret_key);
        
        return res.status(200).json({'status': 200, 'message': {token}});
    }
    
    // Si el formato del body de la petición no es el correcto, se retorna una respuesta 400
    return res.status(400).json({'status': 400, 'message': 'El formato de la petición es incorrecto. Debe incluir los parametros username y color'});
});

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
