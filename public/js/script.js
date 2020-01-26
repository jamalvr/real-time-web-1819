(function () {
    const socket = io();

    // Var = global
    var userList = [];
    var username = null;

    ////// Helper
    const kebabString = function (string) {
        let kebabify = string.replace(/\s/g, '-');
        let toLowerCase = kebabify.toLowerCase();
        return toLowerCase;
    };

    ////// Start game button
    const startGame = function () {
        const gameButton = document.querySelector('.game-start');
        gameButton.classList.remove('hide');

        gameButton.addEventListener('click', function () {
            socket.emit('startGame');
        });
    };

    socket.on('gameState', function (gameRunning) {
        console.log(gameRunning);
        if (gameRunning) {
            const gameButton = document.querySelector('.game-start');
            gameButton.classList.add('hide');
        }
    });

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

                        // if (userList.length > 1) {
                        startGame();
                        // }
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
                let template = `<li class="user ${user}">${user}</li>`;
                return listElement.innerHTML += template;
            }
        })
    };

    /////// Set taken usernames
    socket.on('pushUserList', function (userList) {
        updateUserList(userList);
    });

    ////// Get question
    socket.on('newQuestion', function (currentCity, answers) {
        const showCity = function () {
            let cityContainer = document.getElementById('current-city');
            let template = `<h2 class="city-name">Wat is het weer in ${currentCity}?</h2>`;
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

        ////// Send answer
        const sendAnswer = function () {
            let answerButtons = document.getElementsByClassName('answer');
            let answerButtonArray = Array.from(answerButtons);

            answerButtonArray.forEach(function (button) {
                button.addEventListener('click', function () {
                    let answer = button.value;
                    socket.emit('userAnswer', userAnswer);
                });
            });
        };

        showAnswers();
    });
})();