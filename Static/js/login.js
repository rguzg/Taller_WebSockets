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

// Enviar petición a /login cuando se haga click en #empezar_chatear
document.querySelector('#empezar_chatear').addEventListener('click', async () => {
    let username = document.querySelector('#nombre').value;
    let color = document.querySelector('#color').value;

    try {
        let response = await fetch('login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                color
            })
        });
    
        let json = await response.json();
    
        // Si response.ok es verdadero, se almacena el JWT en SessionStorage. Si response.ok es falso
        // se imprime el codigo de error en la consola
        if(response.ok){
            sessionStorage.setItem('token', json['message']['token']);
        } else {
            console.error(`${json['status']}: ${json['message']}`);
        }
    } catch (error) {
        console.error(error);
    }
});