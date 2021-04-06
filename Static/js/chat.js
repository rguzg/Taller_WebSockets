let username;
let color;
let ws;

const toggleChatMemberScreen = () => {
    let chat_members_container = document.querySelector('#chat_members');

    chat_members_container.classList.toggle('h-display-none');
    document.querySelector('#chat').classList.toggle('h-display-none');
}

const CreateMensajeBienvenida = () => {
    let span = document.createElement('span');
    span.innerText = "¡Bienvenido a la sala de chat!";
    span.classList.add('m-chat__bienvenido');

    return span;
}

const CreateMensajeReconexion = () => {
    let message_container = document.createElement('div');
    let loading_icon = document.createElement('img');
    let loading_message = document.createElement('span');

    // Definición de message_container
    message_container.classList.add('h-flex');
    message_container.id = 'mensaje_conexion';

    // Definición de loading_icon
    loading_icon.classList.add('h-mr1');
    loading_icon.src = './Static/img/loading.svg';

    // Definición de loading_message
    loading_message.classList.add('m-chat__bienvenido');
    loading_message.innerText = 'Reconectando al chat...'

    message_container.appendChild(loading_icon);
    message_container.appendChild(loading_message);

    return message_container;
}

// Mostrar #chat_members junto con la lista de usuarios conectados
document.querySelector('#open_chat_members').addEventListener('click', async () => {
    toggleChatMemberScreen();
    
    try {
        let request = await fetch('/connected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        let json = await request.json();

        if(request.ok){
            let chat_members = json.message;
            let members = document.querySelector('.m-chat-box__members');

            // Este es un hack todo feo, pero por el momento está bien usarlo
            members.innerHTML = "";

            chat_members.forEach((chat_member) => {
                let username = document.createElement('span');

                username.innerText = chat_member;
                username.style.fontWeight = 'bold';
                username.style.color = 'var(--purple)';
                username.style.marginBottom = '0.25rem';

                members.appendChild(username);
            });
        } else {
            alert(json.message);
        }

        if(request.status === 401){
            window.location = '/';
        }
    } catch (error) {
        console.error(error);
        alert(error);
    } 
});

// Cerrar #chat_members y eliminar la lista de usuarios conectados
document.querySelector('#close_chat_members').addEventListener('click', () => {
    toggleChatMemberScreen();

    let members = document.querySelector('.m-chat-box__members');

    // Este es un hack todo feo, pero por el momento está bien usarlo
    members.innerHTML = "";
});

// Al regresar a / también se cerrará sesión
document.querySelector('#back').addEventListener('click', () => {
    sessionStorage.removeItem('token');
    window.location = "/";
});

document.querySelector('#send_message').addEventListener('click', () => {
    let message = document.querySelector('#chat_text-box').value;

    // Solo enviar mensajes cuando el estado de WS esté conectado al servidor
    // y cuando message no esté vacio
    if(ws.connected && message.trim() != ""){
        ws.emit('message' ,JSON.stringify({
            message,
            username,
            color
        }));

        document.querySelector('#chat_text-box').value = "";
    }
});

// Enviar el mensaje cuando se presione enter y cuando se #chat_text-box tenga focus 
document.querySelector('#chat_text-box').addEventListener('keydown', (event) => {
    if(event.code === 'Enter'){
        event.preventDefault();
        document.querySelector('#send_message').dispatchEvent(new Event('click'));
    }
});

// Cuando la página haya cargado completamente, se verifica que exista un JWT valido,
// si no existe, se regresa a /. Si si existe, se almacenan los contenidos del token en memoria 
// y se conecta al servidor de WS
window.addEventListener('load', () => {
    // Mostrar en el chat los mensajes recibidos
    const OnWSMessage = (message) => {
        let chat_message_container = document.createElement('div');
        let username = document.createElement('span');
        let chat_message = document.createElement('span');

        chat_message_container.classList.add("m-chat__message");

        username.style.fontWeight = 'bold';
        username.style.color = message.color;
        username.innerText = message.username;
        
        chat_message.innerText = `: ${message.message}`;

        chat_message_container.appendChild(username);
        chat_message_container.appendChild(chat_message);

        document.querySelector('.m-chat-box__messages').appendChild(chat_message_container);
    };

    // Quitar el mensaje de "Conectando al chat..." y agregando el mensaje de "¡Bienvenido al chat!"
    const OnWSConnect = () => {
        document.querySelector('#mensaje_conexion').remove();

        document.querySelector('.m-chat-box__messages').appendChild(CreateMensajeBienvenida());
    }

    // Si ocurre un error al conectarse con el socket, se le pedirá al usuario que vuelva a iniciar sesión
    const OnWSConnectError = (error) => {
        alert("Ocurrió un error al conectarse con el servidor de WS, es necesario que vuelvas a iniciar sesión");
        console.error(error);

        sessionStorage.removeItem('token');

        window.location = '/';
    }

    try {
        let token = sessionStorage.getItem("token");

        if(token === null){
            window.location = '/';
            return;
        }

        let decoded_token = jwt_decode(token);

        username = decoded_token.username;
        color = decoded_token.color;

        ws = io('http://localhost:3000', {
            auth: {token},
            transports: ["websocket"],
        });

        ws.on('message', OnWSMessage);
        ws.on('connect', OnWSConnect);
        ws.on('connect_error', OnWSConnectError);
        
    } catch (error) {
        alert("Ocurrió un error de autenticación, es necesario que vuelvas a iniciar sesión");
        sessionStorage.removeItem('token');
        window.location = '/';
    }
});
