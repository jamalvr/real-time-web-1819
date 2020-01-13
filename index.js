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

////// Room
const userNumber = 0;

io.on('connection', function (socket) {
    // socket.on('create', function (game) {
    //     socket.join(game);
    // });   
});

server.listen(port, function () {
    console.log('Server listening at port', port);
});