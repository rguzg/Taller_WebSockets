const toggleChatMemberScreen = () => {
    document.querySelector('#chat_members').classList.toggle('h-display-none');
    document.querySelector('#chat').classList.toggle('h-display-none');
}

const goBack = () => {
    window.location = "/";
}

document.querySelector('#open_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#close_chat_members').addEventListener('click', toggleChatMemberScreen);
document.querySelector('#back').addEventListener('click', goBack);