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
var gameRunning = false;

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
        if (userList.indexOf(username) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = username;
            console.log(socket.username);
            userList.push(username);
            io.emit('pushUserList', userList, username);
        }
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
        socket.emit('enableCity');
        socket.on('city', function (city) {
            currentCity = city;
            emitQuestion();
        });
    }

    emitQuestion = function () {
        // currentCity = cities[cityIndex];
        correctAnswer = 'rainy';
        io.emit('newQuestion', currentCity, answers);

        socket.on('userAnswer', function (userAnswer) {
            console.log(userAnswer);
            if (userAnswer === correctAnswer) {
                console.log('Right Answer');
            } else {
                console.log('Wrong Answer');
            }
        });
    }
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});