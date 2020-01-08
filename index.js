var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.set('views', './assets/views/');

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.use(express.static('public'));

io.on('connection', function (socket) {
    console.log('a user connected');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});