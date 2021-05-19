const toggleChatMemberScreen = () => {
    let chat_members_container = document.querySelector('#chat_members');

    chat_members_container.classList.toggle('h-display-none');
    document.querySelector('#chat').classList.toggle('h-display-none');
}

document.querySelector('#back').addEventListener('click', () => {
    window.location = "/";
});

document.querySelector('#open_chat_members').addEventListener('click', () => {
    toggleChatMemberScreen();
});

document.querySelector('#close_chat_members').addEventListener('click', () => {
    toggleChatMemberScreen();
});

document.querySelector('#open_chat_members').addEventListener('click', async () => {
    let response = await fetch('/connected');

    let json = await response.json();

    let miembros = document.querySelector('#chat_members');

    json['message'].forEach(miembro => {
        let span = document.createElement('span');
        span.textContent = miembro;
        span.style.color = "#ffffff";

        miembros.appendChild(span);
    });
});

function CrearMensaje(mensaje, color, nombre_usuario) {
    let contenedor_mensaje = document.createElement('div');
    let username = document.createElement('span');
    let texto = document.createElement('span');

    // Definición de username
    username.innerText = nombre_usuario;
    username.style.fontWeight = "bold";
    username.style.color = color;

    // Definición de texto
    texto.innerText = ": " + mensaje;

    // Definicion de contenedor_mensaje
    contenedor_mensaje.classList.add('m-chat__message');

    contenedor_mensaje.appendChild(username);
    contenedor_mensaje.appendChild(texto);

    return contenedor_mensaje;
}

document.querySelector('#enviar_mensaje').addEventListener('click', () => {
    let mensaje = document.querySelector('#chat_text-box').value;
    let image_input = document.querySelector('#imagen');

    let image = null;
    let json_mensaje = {};

    if(image_input.value){
        let reader = new FileReader();
        reader.readAsArrayBuffer(image_input.files[0]);

        reader.onload = () => {
            image = reader.result;
            image = new Uint8Array(image);

            json_mensaje = {
                username: sessionStorage.getItem('username'),
                color: sessionStorage.getItem('color'),
                message: mensaje,
                image
            }

            // ws.send(JSON.stringify(json_mensaje));
            ws.emit('message', json_mensaje)
        }
    } else {
        json_mensaje = {
            username: sessionStorage.getItem('username'),
            color: sessionStorage.getItem('color'),
            message: mensaje,
        }

        ws.emit('message', json_mensaje);
        // ws.send(JSON.stringify(json_mensaje));
    }

    document.querySelector('#chat_text-box').value = "";
});

// let ws = new WebSocket('ws://localhost:3000?number=2');
let ws = io('wss://d2ce49d398d0.ngrok.io', {
    auth: {
        numero: 2
    },
    transports: ["websocket"]
});

ws.on('connect', () => {
    console.log("Estoy conectado");
});

ws.on('message', (message) => {
    console.log(message);

        // let parsed_json = JSON.parse(message.data);
    
        let nuevo_mensaje = CrearMensaje(message.message, message.color, message.username);
    
        let contenedor_mensajes = document.querySelector('.m-chat-box__messages');
        
        contenedor_mensajes.appendChild(nuevo_mensaje);
    
        if(message.image){
            let blob_url = URL.createObjectURL(new Blob([Uint8Array.from(message.image)]));
    
            let image = document.createElement('img');
            image.src = blob_url;
    
            contenedor_mensajes.appendChild(image);
        }
    
});

// ws.onopen = () => {
//     // ws.send("Hola Mundo");
// }

// ws.onmessage = (message) => {
//     console.log(message);

//     let parsed_json = JSON.parse(message.data);

//     let nuevo_mensaje = CrearMensaje(parsed_json.message, parsed_json.color, parsed_json.username);

//     let contenedor_mensajes = document.querySelector('.m-chat-box__messages');
    
//     contenedor_mensajes.appendChild(nuevo_mensaje);

//     if(parsed_json.image){
//         let blob_url = URL.createObjectURL(new Blob([Uint8Array.from(parsed_json.image)]));

//         let image = document.createElement('img');
//         image.src = blob_url;

//         contenedor_mensajes.appendChild(image);
//     }

// }