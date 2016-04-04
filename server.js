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
	toString : function(){
        var os = "\n\n[";
        for(var i =0; i<3; i++){
            for (var j=0; j<3; j++){
                os += this.board[j][i]; 
                if (j != 2)
                    os += ", ";
            }
            os += "]\n"; 
            if (i != 2)
                os+="[";
        }
        os += "\n\n"
        return os;
	}
};

//var mongoose    = require('mongoose');  //will be our orm for database
//var db          = mongoose.connect('mongodb://localhost:3000/users');



//server using express beginning of project
var express     = require('express');
var app         = express(); //create express object
var expressWs   = require('express-ws')(app); //create express websocket extension
var passport    = require('passport'); //used for user authentication
var session     = require('express-session'); //used for user sessions
var flash       = require('connect-flash'); //used for flashing messages to clients
var cookieParser= require('cookie-parser'); //used to read cookies


var gameStarted = false;
var clients = [];

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

var currentPlayer  = {id: "player1", token: "X"};
var previousPlayer = {id: "player2", token: "O"};
var moveNumber = 1;
var player = 1;

app.ws('/game', function(ws, req) { //socket route for game requests

	//for game
	ws.on('message', function(msg) {
        var res = {
            buttonIndex: -1,
            update:      false,
            buttonFrame: -1,
            gameOver:    false,
            result:      ""
        };
        console.log("message recieved");
		msg = JSON.parse(msg);

		if (msg.status){
            console.log("Status: " + msg.status);
            if (msg.firstConnection){
                if (player < 3){
                    var firstConnectRes = {id: "player" + player++};
                    ws.send(JSON.stringify(firstConnectRes));
                }
                else{
                    var spectatorRes = {id: "spectator"};
                    ws.send(JSON.stringify(spectatorRes));
                }
                clients.push(ws);
            }
		}
		else if (msg.cmd === 'play move'){
			buttonRow    = msg.row;
			buttonCol    = msg.col;
			index        = buttonCol * 3 + buttonRow;
			res.buttonIndex = index;
			// Attempt to play the move
			if (msg.playerId === currentPlayer.id && ttt.playMove(buttonRow, buttonCol, currentPlayer.token)){
				// console.log("(row, col): "+ "("+buttonRow+", "+buttonCol+")");
                var frame = (currentPlayer.token === "X") ? 1 : 2;
				// console.log('frame: '+ frame);
				res.update = true;
				res.buttonFrame = frame;
				var temp = currentPlayer;
				currentPlayer = previousPlayer;
				previousPlayer = temp;
				moveNumber++;
				console.log("currentPlayer: ",currentPlayer);
            }
            
            // Check if game is over and report results
            if (res.update){
                var winner = ttt.checkWin();
                if (winner === "" && moveNumber == 10){
                    res.result   = 'It\'s a tie';
                    res.gameOver = true;
                    reset();
                }
                else if (winner !== ""){
                    res.result = 'Winner is: ' + winner;
                    res.gameOver = true;
                    reset();
                }
                
            }
            // console.log(ttt.toString());
            console.log("\n\n",res,"\n\n");
            
            for (var i = 0; i < clients.length; i++){
                clients[i].send(JSON.stringify(res));
            }
            
		}
		function reset(){
            moveNumber = 1;
            currentPlayer  = {id: "player1", token: "X"};
            previousPlayer = {id: "player2", token: "O"};
            ttt.reset();
		}
	});
});

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
