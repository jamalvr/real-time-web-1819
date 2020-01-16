(function () {
    const socket = io();

    // Var = global
    var userList = [];
    var username = null;

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

                    socket.on('pushUserList', function (data) {
                        userList = data;
                        updateUserList();
                    });
                } else {
                    alert('Al bezet biiiiitch');
                }
            });
        })
    };

    setUsername();

    ////// Update user list
    const updateUserList = function () {
        const listElement = document.getElementById('user--list');

        userList.forEach(function (user) {
            console.log(user);
        })
    };

    ////// Create game
    const startGame = function () {
        const createGameButton = document.querySelector('.game--start');

        createGameButton.addEventListener('click', function () {
            socket.emit('startGame');
        });
    };

    socket.on('newQuestion', function (currentCity, answers) {
        console.log('stad =', currentCity);
        console.log('antwoorden =', answers);
    });

    startGame();
})();