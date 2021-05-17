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

    let json_mensaje = {
        username: sessionStorage.getItem('username'),
        color: sessionStorage.getItem('color'),
        message: mensaje
    }

    ws.send(JSON.stringify(json_mensaje));

    document.querySelector('#chat_text-box').value = "";
});

let ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
    // ws.send("Hola Mundo");
}

ws.onmessage = (message) => {
    console.log(message);

    let parsed_json = JSON.parse(message.data);

    let nuevo_mensaje = CrearMensaje(parsed_json.message, parsed_json.color, parsed_json.username);

    let contenedor_mensajes = document.querySelector('.m-chat-box__messages');
    contenedor_mensajes.appendChild(nuevo_mensaje);
}