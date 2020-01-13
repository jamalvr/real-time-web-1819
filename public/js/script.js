(function () {
    const socket = io();
    const joinGame = document.querySelector('.game--join');

    ////// Helper
    const stringCleaner = function (string) {
        let noSpace = string.replace(/\s/g, '');
        let toLowerCase = noSpace.toLowerCase();
        return toLowerCase;
    };

    ////// Sets the client's username
    const setUsername = function () {
        const usernameForm = document.getElementById('username');
        const usernameInput = document.querySelector('.username--input');

        usernameForm.addEventListener('submit', function (event) {
            event.preventDefault();
            let usernameValue = usernameInput.value;
            username = stringCleaner(usernameValue);

            // Tell the server your username
            socket.emit('add user', username);
        })
    };

    setUsername();

    ////// Create game
    const createGameButton = document.querySelector('.game--create');

    const sendGame = function () {
        socket.emit('createGame');
    };

    createGameButton.addEventListener('click', function () {
        sendGame();
    });
})();