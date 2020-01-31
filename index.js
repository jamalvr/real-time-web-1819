////// Require & app start
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

////// Set engine & directories
app.set('view engine', 'ejs');
app.set('views', './assets/views/');
app.use(express.static('public'));

////// Views
app.get('/', function (req, res) {
    res.render('index.ejs');
});

////// Game
var userList = [];
var userSockets = [];
var turn = 0;
var gameRunning = false;
var hasAnswered = [];

//// City globals
var cities = [
    'amsterdam',
    'utrecht',
    'rotterdam',
    'kabul',
    'parus'
];
var cityIndex = 0;
var currentCity = null;

//// Answers
var answers = [
    'sunny',
    'cloudy',
    'rainy',
];

io.on('connection', function (socket) {
    //// Create game
    socket.on('createGame', function (game) {
        socket.join(game);
    });

    //// Users
    socket.on('username', function (username, callback) {
        // Todo: Check if username still exists
        // if (userList.indexOf(username) !== -1) {
        //     callback(false);
        // } else {
        callback(true);
        socket.username = username;

        userList.push({
            username: username,
            score: 0
        });

        userSockets.push(socket);
        io.emit('pushUserList', userList, username);
        // }
    });

    io.emit('pushUserList', userList);

    //// Game state biiiiitch
    socket.on('startGame', function () {
        if (gameRunning) {
            io.emit('gameState', gameRunning);
            selectCity();
            return;
        }
        gameRunning = true;
        io.emit('gameState', gameRunning);
        selectCity();
    });

    //// API
    selectCity = function () {
        userSockets[turn].emit('selectCity');
        console.log('selectCity werkt')
        socket.on('city', function (city) {
            console.log(city);
            currentCity = city;
            emitQuestion();

            // Choose next player for next turn
            turn++;
            if (turn >= userList.length) {
                turn = 0;
            }
        });
    }

    //// Send question to user
    emitQuestion = function () {
        // currentCity = cities[cityIndex];
        correctAnswer = 'rainy';
        io.emit('newQuestion', currentCity, answers);

        socket.on('userAnswer', function (userAnswer) {
            let id = getUserForSocketId(socket.id);

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

            hasAnswered.push(id);
            console.log('Je antwoord is verwerkt');

            //// Add score to right ID
            if (userAnswer === correctAnswer) {
                userList[id].score += 10;
                io.emit('pushUserList', userList);
            }
        });
    }

    getUserForSocketId = function (id) {
        for (let i = 0; i < userSockets.length; i++) {
            if (userSockets[i].id === id) {
                return i;
            }
        }
        return null;
    }
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});