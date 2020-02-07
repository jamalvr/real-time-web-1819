(function () {
    const socket = io();

    // Var = global
    var username = null;
    var gameState = false;

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

                        if (userList.length > 0 && !gameState) {
                            startGame();
                        }
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
            let template = `
            <li class="user ${user.username}">
                ${user.username}
                ${user.score}
            </li>`;
            return listElement.innerHTML += template;
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
            // answerList.innerHTML = '';

            answers.forEach(function (answer) {
                // Create nodes
                let listItem = document.createElement('li');
                let button = document.createElement('button');
                let text = document.createTextNode(answer);

                // Add stuff to node(s)
                button.value = answer;
                button.classList.add('answer');

                // Append nodes to dom
                listItem.appendChild(button);
                button.appendChild(text);
                answerList.appendChild(listItem);

                // Event listeners
                button.addEventListener('click', function () {
                    let userAnswer = button.value;
                    userAnswer.toString();
                    console.log('Answering question with:', userAnswer);
                    socket.emit('userAnswer', userAnswer);
                });

                // let template = `<li><button class="answer" value="${answer}">${answer}</button></li>`;

            });

            // sendAnswer();
        }

        ////// Send answer
        // const sendAnswer = function () {
        //     let answerButtons = document.getElementsByClassName('answer');
        //     let answerButtonArray = Array.from(answerButtons);

        //     answerButtonArray.forEach(function (button) {
        //         button.addEventListener('click', function () {
        //             let userAnswer = button.value;
        //             userAnswer.toString();
        //             console.log('Answering question with:', userAnswer);
        //             socket.emit('userAnswer', userAnswer);
        //         });
        //     });
        // };

        // showAnswers();
    });

    socket.on('gameState', function (gameRunning) {
        if (gameRunning) {
            gameState = true;
            const gameButton = document.querySelector('.game-start');
            gameButton.classList.add('hide');
        }
    });

    ////// Get question
    socket.on('inputCity', function () {
        const getCity = function () {
            const cityForm = document.getElementById('city');
            const cityInput = document.querySelector('.city-input');
            cityForm.classList.remove('hide');
            console.log('city input is shown')
            cityForm.addEventListener('submit', function (event) {
                // Prevent browser refresh
                event.preventDefault();

                let city = cityInput.value;
                console.log('emitting yout city: ' + city);
                // Do API request from backend here
                socket.emit('city', city);

                // Hide when done
                cityForm.classList.add('hide');
                console.log('emitting city done, hide the MF');
            });
        };

        getCity();
    });

    ////// Send answer
})();