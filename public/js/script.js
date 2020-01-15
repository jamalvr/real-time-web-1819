(function () {
    const socket = io();
    const joinGame = document.querySelector('.game--join');

    ////// Helper
    const kebabString = function (string) {
        let kebab = string.replace(/\s/g, '-');
        let toLowerCase = kebab.toLowerCase();
        return toLowerCase;
    };

    ////// Sets the client's username
    const setUsername = function () {
        const usernameForm = document.getElementById('username');
        const usernameInput = document.querySelector('.username--input');

        usernameForm.addEventListener('submit', function (event) {
            // Prevent browser refresh
            event.preventDefault();

            // Get clean user input values
            let usernameValue = usernameInput.value;
            username = kebabString(usernameValue);

            // Tell the server your username
            socket.emit('username', username, function (callback) { // Hoe komt data van username nou hier? Dat snap ik niet helemaal
                if (callback) {
                    usernameForm.classList.add('hide');
                    console.log(username);
                } else {
                    console.log(username);
                }
            });
        })
    };

    socket.on('userlist', function (result) {
        alert('de userist is aangepast:' + JSON.stringify(result));
    });

    setUsername();

    ////// Update user list
    const userList = function () {
        const listElement = document.getElementById('user--list');

        forEach(user in userList, function () {

        });
    };

    ////// Create game
    const game = function () {
        const createGameButton = document.querySelector('.game--create');

        const sendGame = function () {
            socket.emit('create game');
        };

        createGameButton.addEventListener('click', function () {
            sendGame();
        });
    };

    game();
})();