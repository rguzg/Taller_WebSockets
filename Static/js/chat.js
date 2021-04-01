let username;
let color;
let ws;

const toggleChatMemberScreen = () => {
    document.querySelector('#chat_members').classList.toggle('h-display-none');
    document.querySelector('#chat').classList.toggle('h-display-none');
}

const goBack = () => {
    window.location = "/";
}

const CreateMensajeBienvenida = () => {
    let span = document.createElement('span');
    span.innerText = "¡Bienvenido a la sala de chat!";
    span.classList.add('m-chat__bienvenido');

    return span;
}

// Quitar el mensaje de "Conectando al chat..." y agregando el mensaje de "¡Bienvenido al chat!"
const OnWSOpen = () => {
    document.querySelector('#mensaje_conexion').remove();

    document.querySelector('.m-chat-box__messages').appendChild(CreateMensajeBienvenida());
}

document.querySelector('#open_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#close_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#back').addEventListener('click', goBack);

// Cuando la página haya cargado completamente, se verifica que exista un JWT valido,
// si no existe, se regresa a /. Si si existe, se almacenan los contenidos del token en memoria 
// y se conecta al servidor de WS
window.addEventListener('load', () => {
    try {
        let decoded_token = jwt_decode(sessionStorage.getItem("token"));

        username = decoded_token.username;
        color = decoded_token.color;

        ws = new WebSocket('ws://localhost:3000');
        ws.onopen = OnWSOpen;
    } catch {
        window.location = '/';
    }
});
