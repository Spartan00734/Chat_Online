document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const usernameContainer = document.getElementById('username-container');
    const chatContainer = document.getElementById('chat-container');
    const usernameInput = document.getElementById('username-input');
    const usernameSubmit = document.getElementById('username-submit');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages');
    const usersList = document.getElementById('users');
    const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#A52A2A', '#FFA500', '#800080', '#EE82EE']; // Negro, Rojo, Azul, Verde, Café, Naranja, Morado, Violeta

    let username;
    let userColor;

    usernameSubmit.addEventListener('click', () => {
        username = usernameInput.value.trim();
        if (username) {
            socket.emit('request color', username);
            usernameContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        }
    });

    socket.on('assign color', (color) => {
        userColor = color;
        socket.emit('set username', { username, userColor });
    });

    socket.on('previous messages', (msgs) => {
        msgs.forEach((msg) => {
            appendMessage(msg.username, msg.message, msg.userColor);
        });
    });

    socket.on('user joined', (data) => {
        updateUsersList(data.users);
        appendMessage('System', `${data.username} joined the chat`, '#000');
    });

    socket.on('user left', (data) => {
        updateUsersList(data.users);
        appendMessage('System', `${data.username} left the chat`, '#000');
    });

    socket.on('chat message', (data) => {
        appendMessage(data.username, data.message, data.userColor);
    });

    document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (messageInput.value.trim()) {
            socket.emit('chat message', messageInput.value);A
            messageInput.value = '';
        }
    });

    function appendMessage(username, message, color) {
        const messageElement = document.createElement('div');
        messageElement.style.color = color;
        const usernameElement = document.createElement('strong');
        usernameElement.textContent = username + ": ";
        const messageText = document.createElement('span');
        messageText.textContent = message;
        messageElement.appendChild(usernameElement);
        messageElement.appendChild(messageText);
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    }

    function updateUsersList(users) {
        usersList.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('li');
            userElement.textContent = user.username;
            userElement.style.color = user.color;
            usersList.appendChild(userElement);
        });
    }
});
