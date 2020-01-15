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
            console.log(username);
            userList.push(username);
            socket.username = username;
            console.log(userList);
            socket.emit('userlist', {
                userList
            });
        }
    });
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});