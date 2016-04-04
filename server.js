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
// 		msg = msg.split(',');
// 		console.log("msg[0]: "+msg[0]);
		console.log("moveNum: "+moveNumber);
		console.log("currPlayer: "+currentPlayer);
		
		msg = JSON.parse(msg);

		if (msg.status){
            console.log("Status: " + msg.status);
		}
		else if (msg.cmd === 'play move'){
            console.log("\n\n\nINSIDE PLAY MOVE\n\n\n");
			buttonRow    = msg.row;
			buttonCol    = msg.col;
			
			// Attempt to play the move
			if (ttt.playMove(buttonRow, buttonCol, currentPlayer)){
				console.log("(row, col): "+ "("+buttonRow+", "+buttonCol+")");
                var frame = (currentPlayer === "X") ? 1 : 2;
				console.log('frame: '+ frame);
				msg = {movePlayed: true, buttonFrame: frame};
				currentPlayer = (currentPlayer === "X") ? "O" : "X";
				moveNumber++;
				
            }
            else{
                msg = {movePlayed: false};
            }
            
            // Check if game is over and report results
            if (msg.movePlayed){
                var winner = ttt.checkWin();
                msg.gameOver = false;
                if (winner === "" && moveNumber == 10){
                    msg.result   = 'It\'s a tie';
                    msg.gameOver = true;
                }
                else if (winner !== ""){
                    msg.result = 'Winner is: ' + winner;
                    msg.gameOver = true;
                }
                ws.send(JSON.stringify(msg));
                
                console.log(ttt.toString());
            }
		}
		
// 		else if (msg.cmd === 'check win'){
// 			var winner = ttt.checkWin();
// 			console.log('winner' + winner);
// 			msg = {result: "", type: 'check win'};
//             if (winner === "" && moveNumber == 10){
//                 msg.result = 'It\'s a tie';
//                 ws.send(JSON.stringify(msg));
//             }
//             else if (winner !== ""){
//                 msg.result = 'Winner is: ' + winner;
//                 ws.send(JSON.stringify(msg));
//             }
//             else{
//                 msg.result = "";
//                 ws.send(JSON.stringify(msg));
//             }
// 		}
		else if (msg.cmd === 'end of game'){
			moveNumber = 1;
            currentPlayer = "X";
            gameOver = true;
		}
		else if (msg.cmd === 'reset'){
			ttt.reset();
			moveNumber = 1;
			currentPlayer = "X";
			gameOver = false;
		}
        /*else if (msg.cmd === 'get frame'){
               var frame = (currentPlayer === "X") ? 1 : 2;
               console.log('frame:'+ frame);
               msg = {'frame':frame, type: 'frame'};
               ws.send(JSON.stringify(msg));
        }*/
	});
	console.log('socket', req.testing);
});

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
