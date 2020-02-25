////// Require & app start
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
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
var currentTurn = 0;
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
    // Push current users to new client
    socket.emit('pushUserList', userList);
    socket.emit('checkGameState', gameRunning);

    // Corresponding user gets to see 'inputCity question'
    inputCity = function () {
        userSockets[currentTurn].emit('inputCity');
    };

    //// Send question to user
    checkAnswer = function (userAnswer, id) {
        //// Boevencheck haha
        if (id === null || hasAnswered.includes(id)) {
            return;
        };

        //// This person has answered, yay!
        hasAnswered.push(id);

        //// Add score to right ID
        if (userAnswer === correctAnswer) {
            userList[id].score += 10;
            io.emit('pushUserList', userList);
        };

        turnHandler();
    };

    turnHandler = function () {
        // Check if poller is running and cancel to enable new poll when needed
        if (answerPoller !== null) {
            clearTimeout(answerPoller);
        };

        // AFTER everyone has answered, go to next turn
        if (userList.length === hasAnswered.length) {
            currentTurn++;

            //// End game when turn is higher than the number of players
            if (userList.length === currentTurn) {
                io.emit('gameOver', userList);
                return currentTurn = 0;
            };

            // New turn, no one has answered yet
            hasAnswered = [];

            // City input is pushed to the right user because of current turn
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
                userSockets[currentTurn].emit('cityNotFound', cityValue);
                return;
            };

            let data = cleanData(body);
            correctAnswer = data.weather;
            currentCity = data.name;

            // console.log(body);
            // bodyArray = Object.keys(body);
            console.log(cleanData(body));

            // Emit new question based on request
            io.emit('newQuestion', currentCity, answers, correctAnswer);

            // Callback function to start loop all over again my bro
            answerPoller = setTimeout(function () {
                getCityWeather(cityValue);
            }, 2000);
        });
    };

    const cleanData = function (body) {
        return body = {
            name: body.name,
            weather: body.weather[0].main
        };
    };

    ///////// Socket listeners
    // fill in username & check if it's already taken
    socket.on('username', function (username, available) {
        // Check if username is already taken
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].username === username) {
                console.log(userList);
                available(false);
                return;
            }
        };

        console.log(username + userList);
        // Username is available and will be saved in the username array
        available(true);
        socket.username = username;
        userList.push({
            username: username,
            score: 0
        });

        // Push all socket data to userSocket array so we can target specific sockets later on
        userSockets.push(socket);

        // Add complete list with current socket ID's 
        io.emit('pushUserList', userList);
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
        checkAnswer(userAnswer, id);
    });

    socket.on('resetServer', function () {
        hasAnswered = [];
        userSockets = [];
        correctAnswer = null;
        answerPoller = null;
        userList = [];
        gameRunning = false;
        currentCity = null;

        io.emit('pushUserList', userList);
        io.emit('resetClient', currentCity);
        io.emit('checkGameState', gameRunning);
    });
});

//// Check is server running and which port
server.listen(port, function () {
    console.log('Server listening at port', port);
});