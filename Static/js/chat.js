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

    // Solo enviar mensajes cuando el estado de WS sea uno, osea cuando esté conectado al servidor
    // y cuando message no esté vacio
    if(ws.readyState === 1 && message.trim() != ""){
        ws.send(JSON.stringify({
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

    // Quitar el mensaje de "Conectando al chat..." y agregando el mensaje de "¡Bienvenido al chat!"
    const OnWSOpen = () => {
        document.querySelector('#mensaje_conexion').remove();

        document.querySelector('.m-chat-box__messages').appendChild(CreateMensajeBienvenida());
    }

    // Si ocurre un error al conectarse con el socket, se le pedirá al usuario que vuelva a iniciar sesión
    const OnWSError = (error) => {
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

        ws = new WebSocket(`ws:///localhost:3000?token=${token}`);
        ws.onopen = OnWSOpen;
        ws.onerror = OnWSError;
        ws.onmessage = OnWSMessage;
    } catch (error) {
        alert("Ocurrió un error de autenticación, es necesario que vuelvas a iniciar sesión");
        sessionStorage.removeItem('token');
        window.location = '/';
    }
});
