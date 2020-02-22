"use strict";

var socket = io();

///////// Globals
var username = null;
var gameState = false;

///////// Helper
const helper = {
    kebabString: function (string) {
        let kebabify = string.replace(/\s/g, '-');
        let toLowerCase = kebabify.toLowerCase();
        return toLowerCase;
    }
};

// Start game button
const game = {
    start: function () {
        const gameButton = document.querySelector('.game-start');
        gameButton.classList.remove('hide');

        gameButton.addEventListener('click', function () {
            console.log('start game')
            socket.emit('startGame');
        });
    },

    // reset: function () {
    //     socket.emit('resetGame');
    // },
};

const user = {
    // Sets the client's username
    setUsername: function () {
        const usernameForm = document.getElementById('username');
        const usernameInput = document.querySelector('.username-input');
        usernameForm.classList.remove('hide');

        // todo: figure out why this event is pushed for every socket that's connected
        usernameForm.addEventListener('submit', function (event) {
            console.log(event);
            console.log(socket);
            // Prevent browser refresh
            event.preventDefault();

            // Get clean user input values
            let usernameValue = usernameInput.value;
            username = helper.kebabString(usernameValue);

            // Tell the server your username
            socket.emit('username', username, function (available) { // Hoe komt data van username nou hier? Dat snap ik niet helemaal
                console.log(username);
                if (available) {
                    usernameForm.classList.add('hide');
                } else {
                    alert('Al bezet biiiiitch');
                }
                return;
            });
        });
    },

    // Update user list
    addToList: function (userList) {
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
    },
};

const city = {
    // Show city input field and push to server
    get: function () {
        const cityFormElement = document.getElementById('city');
        const cityValueElement = document.querySelector('.city-input');

        // Show input field
        cityFormElement.classList.remove('hide');
        console.log('city input is shown');

        // Add submit to communicate to server
        cityFormElement.addEventListener('submit', function (event) {
            // Prevent browser refresh
            event.preventDefault();

            // Get value from user
            let cityValue = cityValueElement.value;
            console.log('emitting your city: ' + cityValue);

            // Send input value back to the server
            socket.emit('cityValue', cityValue, function (callback) {
                console.log(callback);
                if (callback) {
                    cityFormElement.classList.add('hide');
                };
            });
        });
    },

    // Template to show the chosen city to user
    show: function (currentCity) {
        let cityContainer = document.getElementById('current-city');
        let template = `<h2 class="city-name">Wat is het weer in ${currentCity}?</h2>`;
        return cityContainer.innerHTML = template;
    },

    showAnswers: function (answers) {
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
    },
};

const score = {
    getAll: function (userList) {
        let playerScore = 0;
        let allScores = [];

        // Get user specific score
        userList.forEach(function (user) {
            if (user.username === username) {
                playerScore = user.score;
            }
        });

        // map scores
        userList.map(function score(user) {
            let score = user.score
            return allScores.push(score);
        });

        score.showWinner(playerScore, allScores);
    },

    showWinner: function (playerScore, allScores) {
        let winnerWinner = document.getElementById('chicken-dinner');
        let template = null;

        winnerWinner.classList.remove('hide');

        // Get highest score
        let highestScore = Math.max(...allScores);

        // If player has highest score and is not zero, wins!
        if (playerScore === highestScore && playerScore !== 0) {
            template = `<h1>You win!</h1>`
        } else {
            template = `<h1>You lose!</h1>`
        }

        winnerWinner.innerHTML = template;
    },
};

// Cheat sheet menu
const cheatSheet = {
    containerElement: document.getElementById('cheat-sheet'),

    button: function () {
        // Le button functionality
        let button = document.getElementById('cheat-sheet-button');
        let parent = this;

        button.addEventListener('click', function () {
            parent.containerElement.classList.toggle('hide');
        });
    },

    container: function (correctAnswer) {
        this.containerElement.innerText = "Right answer is: " + correctAnswer;
    },
};

///////// Socket listeners
socket.on('checkGameState', function (gameRunning) {
    // Check if game is already running when a new user/socket joins
    if (!gameRunning) {
        // Enable socket to fill in his name
        user.setUsername();
    }
});

// When server gets new users, push them to frontend
socket.on('pushUserList', function (userList) {
    user.addToList(userList);

    // Enable to start game after 'x' amount of users
    if (userList.length > 0 && !gameState) {
        game.start();
    }
});

// Set game state to true and hide the start button for everyone
socket.on('removeStartButton', function (gameRunning) {
    if (gameRunning) {
        gameState = true;
        const gameButton = document.querySelector('.game-start');
        gameButton.classList.add('hide');
    }
});

socket.on('cityNotFound', function (cityValue) {
    window.alert('Hey, dude... ' + cityValue + ' bestaat toch helemaal niet man');
    city.get();
});

// Server calls that the user can type a city to their liking
socket.on('inputCity', function () {
    city.get();
});

// A (new) question comes in from the server with the chosen city and possible answers
socket.on('newQuestion', function (currentCity, answers, correctAnswer) {
    // Show the current city to user
    city.show(currentCity);
    city.showAnswers(answers);

    // Push correctAnswer to the cheat sheet
    cheatSheet.container(correctAnswer);
});

socket.on('gameOver', function (userScore, userList) {
    score.getAll(userScore, userList);
});

cheatSheet.button();