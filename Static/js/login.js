// El usuario solo podrá crear una cuenta cuando el input de nombre no esté vacío

// El evento input se ejecuta cuando se edita el input, a diferencia de el evento change donde 
// el evento solo se ejecuta cuando el input pierde focus
document.querySelector('#nombre').addEventListener('input', (element) => {
    if(element.currentTarget.value && element.currentTarget.value.trim()){
        document.querySelector('#empezar_chatear').removeAttribute('disabled');
    } else {
        document.querySelector('#empezar_chatear').setAttribute('disabled', '');
    }
});

document.querySelector('#empezar_chatear').addEventListener('click', async () => {
    let username = document.querySelector('#nombre').value;
    let color = document.querySelector('#color').value;

    if(username && color){
        let response = await fetch('/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                color
            })
        });

        let json = await response.json();

        if(response.ok){
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('color', color);

            window.location = '/chat';
        } else {
            alert("Ocurrió un error al iniciar sesión");
        }
    }
    
    
});