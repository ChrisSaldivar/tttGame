var ttt = {
	board: [["","",""], ["","",""], ["","",""]],
	ROWS:  3,
	COLS:  3,
	reset: function(){
		for (var i = 0; i < this.ROWS; i++) {
			for (var j = 0; j < this.COLS; j++){
				this.board[i][j] = "";
			}
		}
	},
	checkWin: function(){
        var winner = "";
		// Horizontal win
		for (var i = 0; i < this.ROWS; i++)
            if (this.board[i][0] == this.board[i][1] && this.board[i][1] == this.board[i][2])
                if (this.board[i][0] !== ""){
                    winner = this.board[i][0];
				}
		// Vertical win
        for (i = 0; i < this.COLS; i++)
            if (this.board[0][i] == this.board[1][i] && this.board[1][i] == this.board[2][i])
                if (this.board[0][i] !== ""){
                     winner = this.board[0][i];
				}
		// Diagonol win
		if ((this.board[0][0] == this.board[1][1] && this.board[1][1] == this.board[2][2]) || 
            (this.board[0][2] == this.board[1][1] && this.board[1][1] == this.board[2][0]))
                if (this.board[1][1] !== ""){
					winner = this.board[1][1];
                }
		return winner;
	},
	playMove: function(row, col, token){
        var validMove = false;
        if (this.board[row][col] === ""){
			this.board[row][col] = token;
			validMove = true;
		}
		return validMove;
	},
};

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

	//for game
	var currentPlayer = "X";
    var moveNumber = 1;
    var gameOver = false;
    //

	ws.on('message', function(msg) {
		msg = msg.split(',');
		console.log(msg[0]);
		console.log(moveNumber);
		console.log(currentPlayer);
		if (msg[0] === 'play move'){
			buttonRow    = msg[1];
			buttonCol    = msg[2];
			if (ttt.playMove(buttonRow, buttonCol, currentPlayer)){
				console.log(buttonRow,buttonCol);

            	var frame = (currentPlayer === "X") ? 1 : 2;
				console.log('frame:'+ frame);
				ws.send('true,' + frame);
				currentPlayer = (currentPlayer === "X") ? "O" : "X";
				moveNumber++;
	    	}
		}
		else if (msg[0] === 'check win'){
			var winner = ttt.checkWin();
			console.log('winner' + winner);
            if (winner === "" && moveNumber == 10){
                ws.send('tie');
            }
            else if (winner !== ""){
            	ws.send('win,'+ winner);
            }
		}
		else if (msg[0] === 'end of game'){
			moveNumber = 1;
        	currentPlayer = "X";
        	gameOver = true;
		}
		else if (msg[0] === 'reset'){
			ttt.reset();
		}
		else if (msg[0] === 'get frame'){
			var frame = (currentPlayer === "X") ? 1 : 2;
			console.log('frame:'+ frame);
			ws.send(frame.toString());
		}
		else if (msg[0] === 'create'){
			gameOver = false;
		}
	});
	console.log('socket', req.testing);
});

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
