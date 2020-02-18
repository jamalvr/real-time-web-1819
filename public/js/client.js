(function () {
    const socket = io();

    /////////
    ///////// Globals
    /////////
    var username = null;
    var gameState = false;

    /////////
    ///////// Helper
    /////////
    const kebabString = function (string) {
        let kebabify = string.replace(/\s/g, '-');
        let toLowerCase = kebabify.toLowerCase();
        return toLowerCase;
    };

    /////////
    //////// Client functionality
    /////////
    // Start game button
    const startGame = function () {
        const gameButton = document.querySelector('.game-start');
        gameButton.classList.remove('hide');

        gameButton.addEventListener('click', function () {
            socket.emit('startGame');
        });
    };

    // Sets the client's username
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

    // Update user list
    const updateUserList = function (userList) {
        const listElement = document.getElementById('user-list');

        // Clear old html
        listElement.innerHTML = '';

        userList.forEach(function (user) {
            let template = `
            <li class="user ${user.username}">
                <span class="name">${user.username}</span>
                <span class="score">Score: ${user.score}</span>
            </li>`;
            return listElement.innerHTML += template;
        });
    };

    // Show city input field and push to server
    const getCity = function () {
        const cityForm = document.getElementById('city');
        const cityInput = document.querySelector('.city-input');

        // Show input field
        cityForm.classList.remove('hide');
        console.log('city input is shown')

        // Add submit to communicate to server
        cityForm.addEventListener('submit', function (event) {
            // Prevent browser refresh
            event.preventDefault();

            // Get value from user
            let city = cityInput.value;
            console.log('emitting yout city: ' + city);

            // Send input value back to the server
            socket.emit('city', city);

            // Hide when done
            cityForm.classList.add('hide');
        });
    };

    // Template to show the chosen city to user
    const showCity = function (currentCity) {
        let cityContainer = document.getElementById('current-city');
        let template = `<h2 class="city-name">Wat is het weer in ${currentCity}?</h2>`;
        
        return cityContainer.innerHTML = template;
    }

    const showAnswers = function (answers) {
        // Get static parent HTML to place answers in
        let answerList = document.getElementById('current-answers');
        answerList.innerHTML = '';

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

            // Event listener
            button.addEventListener('click', function () {
                let userAnswer = button.value;
                userAnswer.toString();
                console.log('Answering question with:', userAnswer);

                // Send answer back to server
                socket.emit('userAnswer', userAnswer);
            });
        });
    }

    const clearGame = function () {

    }

    const getAllScores = function (userList) {
        let playerScore = 0;
        let allScores = [];

        // Get user specific score
        userList.forEach(function (user) {
            if (user.username === username) {
                playerScore = user.score;
            }
        });

        // map scores
        userList.map(score = function (user) {
            let score = user.score
            return allScores.push(score);
        });

        showWinner(playerScore, allScores);
    }

    const showWinner = function (playerScore, allScores) {
        let winnerWinner = document.getElementById('chicken-dinner');
        let template = null;

        winnerWinner.classList.remove('hide');

        // Get highest score
        let highestScore = Math.max(...allScores);

        if (playerScore === highestScore) {
            template = `<h1>You win!</h1>`
        } else {
            template = `<h1>You lose!</h1>`
        }

        winnerWinner.innerHTML = template;
    }

    /////////
    ///////// Socket listeners
    /////////
    // When server gets new users, push them to frontend
    socket.on('pushUserList', function (userList) {
        updateUserList(userList);
    });

    // Set game state to true and hide the start button
    socket.on('gameState', function (gameRunning) {
        if (gameRunning) {
            gameState = true;
            const gameButton = document.querySelector('.game-start');
            gameButton.classList.add('hide');
        }
    });

    // Server calls that the user can type a city to their liking
    socket.on('inputCity', function () {
        getCity();
    });

    // A (new) question comes in from the server with the chosen city and possible answers
    socket.on('newQuestion', function (currentCity, answers) {
        // Show the current city to user
        showCity(currentCity);
        showAnswers(answers);
    });

    socket.on('gameOver', function (userScore, userList) {
        getAllScores(userScore, userList);
    });
})();