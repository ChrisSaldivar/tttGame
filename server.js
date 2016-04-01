//server using express beginning of project
var express   = require('express');
var app       = express(); //create express object
var expressWs = require('express-ws')(app); //create express websocket extension

app.post('/auth', function(req, res) { //route for checking user login
	//check for valid login
	res.sendFile(__dirname + '/public/main.html');
	console.log('Login Good.');
});

app.post('/newUser', function(req, res) { //route for checking new user login
	//check for valid login
	res.sendFile(__dirname + '/public/main.html');
	console.log('Login Good.');
});

app.ws('/game', function(ws, req) { //socket route for game requests
	ws.on('message', function(msg) {
		console.log(msg);
		//handle requests sent by game
	});
	console.log('socket', req.testing);
});

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
