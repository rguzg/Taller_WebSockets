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

