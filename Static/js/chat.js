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

// Si ocurre un error al conectarse con el socket, se le pedirá al usuario que vuelva a iniciar sesión
const OnWSError = (error) => {
    console.error(error);
    window.location = '/';
}

document.querySelector('#open_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#close_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#back').addEventListener('click', goBack);

document.querySelector('#send_message').addEventListener('click', () => {
    // Solo enviar mensajes cuando el estado de WS sea uno, osea cuando esté conectado al servidor
    if(ws.readyState === 1){
        let message = document.querySelector('#chat_text-box').value;

        ws.send(JSON.stringify({
            message,
            username,
            color
        }));

        document.querySelector('#chat_text-box').value = "";
    }
});

// Cuando la página haya cargado completamente, se verifica que exista un JWT valido,
// si no existe, se regresa a /. Si si existe, se almacenan los contenidos del token en memoria 
// y se conecta al servidor de WS
window.addEventListener('load', () => {
    const OnWSMessage = (event) => {
        let parsed_message = JSON.parse(event.data);

        let chat_message_container = document.createElement('div');
        let username = document.createElement('span');
        let chat_message = document.createElement('span');

        chat_message_container.classList.add("m-chat__message");

        username.style.fontWeight = 'bold';
        username.style.color = parsed_message.color;
        username.innerText = parsed_message.username;
        
        chat_message.innerText = `: ${parsed_message.message}`;

        chat_message_container.appendChild(username);
        chat_message_container.appendChild(chat_message);

        document.querySelector('.m-chat-box__messages').appendChild(chat_message_container);
    };

    try {
        let token = sessionStorage.getItem("token");
        let decoded_token = jwt_decode(token);

        username = decoded_token.username;
        color = decoded_token.color;

        ws = new WebSocket(`ws:///77279d0b3b12.ngrok.io?token=${token}`);
        ws.onopen = OnWSOpen;
        ws.onerror = OnWSError;
        ws.onmessage = OnWSMessage;
        ws.onclose = (event) => {
            console.log(event);
        };
    } catch (error) {
        window.location = '/';
    }
});
