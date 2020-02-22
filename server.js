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
var turn = 0;
var gameRunning = false;

///// Users
var userList = [];
var hasAnswered = [];
var userSockets = [];

//// Questions & Answeres
var correctAnswer = null;
var currentCity = null;

// Interval
var answerPoller = null;

// There is no known way to get all weather types
// For now I used the api docks to wright all possible answers manually
var answers = [
    'Snow',
    'Clear',
    'Rain',
    'Drizzle',
    'Thunderstorm',
    'Fog',
    'Clouds',
];

//// Real time connection
io.on('connection', function (socket) {
    ///////// Global emits on connection
    // Push current users to new client
    io.emit('pushUserList', userList);
    socket.emit('checkGameState', gameRunning);

    //////// Server functionality
    inputCity = function () {
        // Corresponding user gets to see 'inputCity question'
        console.log('inputcity');
        userSockets[turn].emit('inputCity');
    };

    //// Send question to user
    checkAnswer = function (userAnswer, id) {
        console.log('question is emitted to users');

        //// Boevencheck haha
        if (id === null) {
            console.log('dacht het even niet he boef');
            return;
        };

        //// Maar 1x antwoord geven
        if (hasAnswered.includes(id)) {
            console.log('Hey hey, je mag maar 1x antwoord geven');
            return;
        };

        //// This person has answered, yay!
        hasAnswered.push(id);
        console.log('Je antwoord is verwerkt');

        //// Add score to right ID
        if (userAnswer === correctAnswer) {
            userList[id].score += 10;
            io.emit('pushUserList', userList);
        };

        console.log('useranswer id = ' + id);
        turnHandler(id);
    };

    turnHandler = function (id) {
        // Check if poller is running and cancel to enable new poll when needed
        if (answerPoller !== null) {
            clearTimeout(answerPoller);
        };

        console.log(userList.length);

        // AFTER everyone has answered, go to next turn
        if (userList.length === hasAnswered.length) {
            console.log('userlist length: ' + userList.length + ' & answered length: ' + hasAnswered.length);
            console.log('setting turn + 1');
            turn++;

            //// End game when turn is higher than the number of players
            if (userList.length === turn) {
                io.emit('gameOver', userList);
                return turn = 0;
            };

            // New turn, no one has answered yet
            console.log('clear array');
            hasAnswered = [];

            // City input is pushed to the right user because of current turn
            console.log('City input pushed to right user');
            inputCity();
        };
    };

    // If socket.id and id parameter match, give them an ID based on their 'userSocket' array index
    getUserForSocketId = function (id) {
        for (let i = 0; i < userSockets.length; i++) {
            if (userSockets[i].id === id) {
                return i;
            };
        };
        return null;
    };

    ///////// Socket listeners
    // fill in username & check if it's already taken
    socket.on('username', function (username, available) {
        // Check if username is already taken
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].username === username) {
                available(false);
                return;
            }
        };

        available(true);
        socket.username = username;
        console.log('username = ' + username);

        userList.push({
            username: username,
            score: 0
        });
        console.log(socket.id);

        // Push all socket data to userSocket array so we can target specific information when we need it
        userSockets.push(socket);

        // Add user data to  the complete user list
        io.emit('pushUserList', userList); // Deleted userName because it wasn't necessary anymore 
    });

    // Game state handler
    socket.on('startGame', function () {
        gameRunning = true;

        // Set game state to true and hide the start button for everyone
        io.emit('removeStartButton', gameRunning);

        // Enable city input form for the player who's turn it is
        inputCity();
    });

    // User fills in a city client side
    socket.on('cityValue', function (cityValue, callback) {
        // Check if someone actually filled in the form
        if (cityValue === '') {
            return callback(false);
        };
        callback(true);

        // If someone answered the form, go to API call
        getCityWeather(cityValue);
    });

    // Listen if the answer has been given from the client
    socket.on('userAnswer', function (userAnswer) {
        let id = getUserForSocketId(socket.id);
        console.log(id + ' | has given answer')
        checkAnswer(userAnswer, id);
    });

    //// API request
    const getCityWeather = function (cityValue) {
        let apiKey = '3d507ebc96a3b532e2eac8b7e613919f';

        request('http://api.openweathermap.org/data/2.5/weather?q=' + cityValue + '&appid=' + apiKey, {
            json: true
        }, async function (err, requestRes, body) {
            let responseCode = '';

            // Typo or wrong input value handler (specific for this api)
            if (body) {
                responseCode = body.cod;
            };

            if (responseCode === '404') {
                userSockets[turn].emit('cityNotFound', cityValue);
                return;
            };

            // Set correct answer globally
            let currentWeather = body.weather[0].main;
            correctAnswer = currentWeather;
            currentCity = body.name;

            console.log(currentWeather);
            console.log(body);

            // Emit new question based on request
            io.emit('newQuestion', currentCity, answers, correctAnswer);

            // Callback function to start loop all over again my bro
            answerPoller = setTimeout(function () {
                getCityWeather(cityValue);
            }, 2000);
        });
    };
});

//// Check is server running and which port
server.listen(port, function () {
    console.log('Server listening at port', port);
});