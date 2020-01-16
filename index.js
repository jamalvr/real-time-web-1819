////// Require & app start
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

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
const answers = [
    'sunny',
    'cloudy',
    'rainy',
]

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
            userList.push(username);
            io.emit('pushUserList', userList);
        }
    });

    //// Game state biiiiitch
    socket.on('startGame', function () {
        // if (gameRunning) {
        //     return;
        // }
        gameRunning = true;
        console.log(gameRunning);
        selectCity();
    });

    //// API
    selectCity = function () {
        currentCity = cities[cityIndex];
        correctAnswer = 'rainy';
        io.emit('newQuestion', currentCity, answers);
    }
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});