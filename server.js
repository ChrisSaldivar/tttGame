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
                os += this.board[i][j]; 
                if (j != 2)
                    os += ", ";
            }
            os += "]\n"; 
            if (i != 2)
                os+="[";
        }
        os += "\n\n";
        return os;
	}
};

var Users = require(__dirname + '/db/databaseModel.js');


//server using express beginning of project
var express     = require('express');
var app         = express(); //create express object
var expressWs   = require('express-ws')(app); //create express websocket extension
var session     = require('express-session'); //used for user sessions
var flash       = require('connect-flash'); //used for flashing messages to clients
var cookieParser= require('cookie-parser'); //used to read cookies
var password    = require('password-hash-and-salt'); //used for hashing password

var print = console.log;


var gameStarted = false;
var clients = {};
var User = Users();
User.init();

app.ws('/auth', function(ws, req) { //route for checking user login
    //check for valid login
	ws.on('message', function(msg){
        print(msg);
        msg = JSON.parse(msg);
        
		if (msg.cmd === 'login'){
            User.verifyUser(msg.username, msg.password, ws);
		}
	});
	
	print('Login Good.');
});

app.ws('/newUser', function(ws, res) { //route for checking new user login
	// Register new user
	ws.on('message', function(msg){
        print(msg);
        msg = JSON.parse(msg);
        
        if (msg.cmd === 'register'){
            User.add(msg.username, msg.password, ws);
        }
	});
	
});

var currentPlayer  = {label: "player1", token: "X"};
var previousPlayer = {label: "player2", token: "O"};
var moveNumber     = 1;
var player         = 1;
var pastMoves      = Array();

function Move (frame, index){
    this.buttonFrame = frame;
    this.buttonIndex = index;
}

app.ws('/game', function(ws, req) { //socket route for game requests

    ws.on('close', function(code, msg){
        removeUser();
    });

	//for game
	ws.on('message', function(msg) {
        var res = {
            buttonIndex: -1,
            update:      false,
            buttonFrame: -1,
            gameOver:    false,
            result:      ""
        };
		msg = JSON.parse(msg);
		print(msg);
		
		if (msg.cmd === 'post message'){
            if (msg.value.match(/:.+/)){
                broadcast(msg);
            }
        }
		else if (msg.status){
            print("Status: " + msg.status);
            if (msg.firstConnection){
                var id = randomString();
                if (player < 3){
                    var firstConnectRes = {label: "player" + player++, id: id};
                    print(firstConnectRes.label, "has joined");
                    ws.send(JSON.stringify(firstConnectRes));
                }
                else{
                    var spectatorRes = {label: "spectator", id: id};
                    print(spectatorRes.label,"has joined");
                    if (gameStarted){
                        spectatorRes.pastMoves   = pastMoves;
                        spectatorRes.gameStarted = gameStarted;
                    }
                    ws.send(JSON.stringify(spectatorRes));
                }
                clients[id] = ws;
            }
		}
		else if (msg.cmd === 'play move'){
			buttonRow    = msg.row;
			buttonCol    = msg.col;
			index        = buttonRow * 3 + buttonCol;
			
			// Attempt to play the move
			print(msg.playerLabel);
			print(currentPlayer.id);
			if (msg.playerLabel === currentPlayer.label && ttt.playMove(buttonRow, buttonCol, currentPlayer.token)){
                playMove(index, res);
            }
            // Check if game is over and report results
            if (res.update){
                checkGameOver(res);
            }
            
            print(ttt.toString());
            
            broadcast(res);
		}
	});
});

function removeUser (){
    var id;
    for (id in clients){
        try{
            clients[id].send(JSON.stringify({test: "t"}));
        }
        catch(INVALID_STATE_ERR){
            delete clients[id];
        }
    }
}

/*
    source: http://stackoverflow.com/a/10727155/5451571
    user:   Nimphious
*/
function randomString() {
    var chars  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var length = 10;
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function playMove (index, res){
    gameStarted = true;
    res.buttonIndex = index;
    var frame = (currentPlayer.token === "X") ? 1 : 2;
    pastMoves.push(new Move(frame, index));
	res.update = true;
	res.buttonFrame = frame;
	var temp = currentPlayer;
	currentPlayer = previousPlayer;
	previousPlayer = temp;
	moveNumber++;
}

function checkGameOver (res){
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

function broadcast (res){
    for (var id in clients){
        clients[id].send(JSON.stringify(res));
    }
}

function reset(){
    moveNumber     = 1;
    currentPlayer  = {label: "player1", token: "X"};
    previousPlayer = {label: "player2", token: "O"};
    gameStarted    = false;
    pastMoves      = Array();
    ttt.reset();
}

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  print('Example app listening on port 3000!');
});
