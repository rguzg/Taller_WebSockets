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

    let response = await fetch('login', {
        method: 'POST',
        body: {
            username,
            color
        }
    });
});