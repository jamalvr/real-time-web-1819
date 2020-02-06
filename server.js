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

io.on('connection', function (socket) {
    //// Users
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

    io.emit('pushUserList', userList);

    //// Game state biiiiitch
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

    //// API
    inputCity = function () {
        // Corresponding user gets to see 'inputCity question'
        userSockets[turn].emit('inputCity');

        // User fills in a city client side
        userSockets[turn].on('city', function (city) {
            // Set currentCity globally for other functions to target
            currentCity = city;
            console.log('City is selected by user ' + turn + ' to: ' + city);

            // Enable all players to answer the corresponding question
            emitQuestion();
        });
    }

    //// Send question to user
    emitQuestion = function () {
        // currentCity = cities[cityIndex];
        correctAnswer = 'rainy';

        // Send the new question to every user
        io.emit('newQuestion', currentCity, answers);

        // Get the answer PER user
        io.on('userAnswer', function (userAnswer) {
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

            //// This person has answered, yay!
            hasAnswered.push(id);
            console.log('Je antwoord is verwerkt');

            //// Add score to right ID
            if (userAnswer === correctAnswer) {
                userList[id].score += 10;
                io.emit('pushUserList', userList);
            }

            // AFTER everyone has answered, select player for next turn
            // Choose next player for next turn
            if (userList.length === hasAnswered.length) {
                turn++;
                console.log(userList)
                console.log(hasAnswered)
                console.log('userlist length: ' + userList.length)
                console.log('hasansw length: ' + hasAnswered.length)
                console.log('setting turn + 1 and go to inputCity')
                inputCity();
            } else {
                console.log(userList)
                console.log(hasAnswered)
                console.log('userlist length: ' + userList.length)
                console.log('hasansw length: ' + hasAnswered.length)
            }
            if (userList.length === turn) {
                console.log('game over');
                turn = 0;
            }
        });
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
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});