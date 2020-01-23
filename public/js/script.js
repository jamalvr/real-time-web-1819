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
        const usernameInput = document.querySelector('.username-input');

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

                    socket.on('pushUserList', function (userList) {
                        updateUserList(userList);
                    });
                } else {
                    alert('Al bezet biiiiitch');
                }
            });
        })
    };

    setUsername();

    ////// Update user list
    const updateUserList = function (userList) {
        const listElement = document.getElementById('user-list');
        listElement.innerHTML = '';

        userList.forEach(function (user) {
            if (userList.indexOf(user) !== -1) {
                console.log(user);
                let template = `<li class="user ${user}">${user}</li>`;
                return listElement.innerHTML += template;
            }
        })
    };

    /////// Set taken usernames
    socket.on('pushUserList', function (userList) {
        updateUserList(userList);
    });

    ////// Create game
    const startGame = function () {
        const createGameButton = document.querySelector('.game-start');

        createGameButton.addEventListener('click', function () {
            socket.emit('startGame');
        });
    };

    startGame();

    ////// Get question
    socket.on('newQuestion', function (currentCity, answers) {
        const showCity = function () {
            let cityContainer = document.getElementById('current-city');
            let template = `<h2 class="city-name">${currentCity}</h2>`;
            return cityContainer.innerHTML = template;
        }

        showCity();

        const showAnswers = function () {
            let answerList = document.getElementById('current-answers');
            answerList.innerHTML = '';

            answers.forEach(function (answer) {
                let template = `<li><button class="answer" value="${answer}">${answer}</button></li>`;
                return answerList.innerHTML += template;
            });

            sendAnswer();
        }

        showAnswers();
    });

    ////// Send answer
    const sendAnswer = function () {
        let answerButtons = document.getElementsByClassName('answer');
        console.log(answerButtons);
    };
})();