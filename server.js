////// Require & app start
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;
const request = require('request');

////// Set engine & directories
app.set('view engine', 'ejs');
app.set('views', './assets/views/');
app.use(express.static('public'));

////// Views
app.get('/', function (req, res) {
    res.render('index.ejs');
});

////// Game
// todo: zijn userList & userSockets niet dubbel?
var userList = [];
var userSockets = [];
var turn = 0;
var gameRunning = false;
var hasAnswered = [];
var currentCity = null;

//// Answers
var answers = [
    'sunny',
    'cloudy',
    'rainy',
];

//// Real time connection
io.on('connection', function (socket) {
    /////////
    //////// Server functionality
    /////////
    inputCity = function () {
        // Corresponding user gets to see 'inputCity question'
        userSockets[turn].emit('inputCity');
    }

    //// Send question to user
    checkAnswer = function (userAnswer, id) {
        // currentCity = cities[cityIndex];
        console.log('question is emitted to users');
        correctAnswer = 'rainy';

        //// Boevencheck haha
        if (id === null) {
            console.log('dacht het even niet he boef');
            return;
        }

        //// Maar 1x antwoord geven
        if (hasAnswered.includes(id)) {
            console.log('Hey hey, je mag maar 1x antwoord geven');
            return;
        }

        //// This person has answered, yay!
        hasAnswered.push(id);
        console.log('Je antwoord is verwerkt');

        //// Add score to right ID
        if (userAnswer === correctAnswer) {
            userList[id].score += 10;
            io.emit('pushUserList', userList);
        }

        console.log('useranswer id = ' + id);
        turnHandler(id);
    }

    turnHandler = function (id) {
        // AFTER everyone has answered, go to next turn
        if (userList.length === hasAnswered.length) {
            console.log('userlist length: ' + userList.length + ' & answered length: ' + hasAnswered.length);
            console.log('setting turn + 1');
            turn++;

            //// End game when turn is higher than the number of players
            if (userList.length === turn) {
                io.emit('gameOver', userList);
                return turn = 0;
            }

            console.log('clear array');
            hasAnswered = [];
            console.log('City input pushed to right user');
            inputCity();
        }
    }

    getUserForSocketId = function (id) {
        for (let i = 0; i < userSockets.length; i++) {
            // If socket.id and id parameter match, give them an ID based on their 'userSocket' array index
            if (userSockets[i].id === id) {
                return i;
            }
        }
        return null;
    }

    ///////// Push current users to new client
    io.emit('pushUserList', userList);

    /////////
    ///////// Socket listeners
    /////////
    // fill in username & check if it's already taken
    socket.on('username', function (username, callback) {
        // Todo: Check if username still exists
        // Check if username is already taken
        // if (userList.indexOf(username) !== -1) {
        //     callback(false);
        // } else {
        callback(true);
        socket.username = username;

        userList.push({
            username: username,
            score: 0
        });

        // Push all socket data to userSocket array so we can target specific information when we need it
        userSockets.push(socket);

        // Add user data to  the complete user list
        io.emit('pushUserList', userList); // Deleted userName because it wasn't necessary anymore 
        // }
    });

    // Game state handler
    socket.on('startGame', function () {
        // if (gameRunning) {
        //     io.emit('gameState', gameRunning);
        //     inputCity();
        //     return;
        // }
        gameRunning = true;
        io.emit('gameState', gameRunning);
        inputCity();
    });

    // User fills in a city client side
    socket.on('city', function (city) {
        // Set currentCity globally for other functions to target
        currentCity = city;
        console.log(socket.id + ' | ' + turn + ' | ' + 'City is selected by user to: ' + city);

        // Send current city & possible answers to client
        io.emit('newQuestion', currentCity, answers);
    });

    // Listen if the answer has been given from the client
    socket.on('userAnswer', function (userAnswer) {
        let id = getUserForSocketId(socket.id);
        console.log(id + ' | has given answer')
        checkAnswer(userAnswer, id);
    });
});

//// API request
const getCityWeather = function (currentCity) {
    const apiKey = '3d507ebc96a3b532e2eac8b7e613919f';

    request('http://api.openweathermap.org/data/2.5/weather?q=' + currentCity + '&appid=' + apiKey, {
        json: true
    }, async function (err, requestRes, body) {
        // console.log('async start');
        if (err) {
            console.log('error:', err);
        }

        console.log('body', body);
        // console.log('requestRes', requestRes);
    });
};

//// Check is server running and which port
server.listen(port, function () {
    console.log('Server listening at port', port);
});