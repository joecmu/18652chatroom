var express = require('express');
var app = express();
var http = require('http').Server(app); //建立http连接
var io = require('socket.io')(http); // sockeio

var mysql = require('mysql');

var users = {};

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'chatroom',
    port: 3306
});

conn.connect(function(err) {
    if (!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});
//连接数据库

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.get('/login.css', function(req, res) {
    res.sendFile(__dirname + '/login.css');
});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/login.html');
});
app.get('/index', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});




//监听socketioconnection
io.on('connection', function(socket) {
    console.log('a user connected');
    //监控disconnect
    socket.on('disconnect', function() {
        //console.log('user disconnected');
        if (!socket.username) return;
        //socket.broadcast.emit('leave', socket.username);
        delete users[socket.username];
        updateUserNames();
    });

    socket.on('new message', function(msg) {
        conn.query('INSERT INTO message VALUES(?, ?, now())', [msg.username, msg.content], function(err, res) {});
        socket.broadcast.emit('msag', msg.username + ":" + msg.content);
        //console.log(msg);
    });

    socket.on('username', function(msg) {
        socket.broadcast.emit("otheruser", msg);
        socket.username = msg;
        users[socket.username] = socket;
        updateUserNames();
    });

    socket.on('gethistory', function() {
        console.log('get');
        conn.query('SELECT * FROM message', function(err, rows) {
            socket.emit('hmessages',rows);
            console.log('send');
        });
    });

    function updateUserNames(){
      socket.broadcast.emit('namelist', Object.keys(users));
      socket.emit('namelist', Object.keys(users));
    }
});

//监听3000
http.listen(3000, function() {
    console.log('listening on *:3000');
});
