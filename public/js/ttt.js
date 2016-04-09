var ttt = function(){
	var board = [["","",""], ["","",""], ["","",""]];
	var ROWS  = 3;
	var COLS  =  3;
	
	ttt.reset = function(){
		for (var i = 0; i < ROWS; i++) {
			for (var j = 0; j < COLS; j++){
				board[i][j] = "";
			}
		}
	};
	
	ttt.checkWin = function(){
        var winner = "";
		// Horizontal win
		for (var i = 0; i < ROWS; i++)
            if (board[i][0] == board[i][1] && board[i][1] == board[i][2])
                if (board[i][0] !== ""){
                    winner = board[i][0];
				}
		// Vertical win
        for (i = 0; i < COLS; i++)
            if (board[0][i] == board[1][i] && board[1][i] == board[2][i])
                if (board[0][i] !== ""){
                     winner = board[0][i];
				}
		// Diagonol win
		if ((board[0][0] == board[1][1] && board[1][1] == board[2][2]) || 
            (board[0][2] == board[1][1] && board[1][1] == board[2][0]))
                if (board[1][1] !== ""){
					winner = board[1][1];
                }
		return winner;
	};
	
	ttt.playMove = function(row, col, token){
        var validMove = false;
        if (board[row][col] === ""){
			board[row][col] = token;
			validMove = true;
		}
		return validMove;
	};
	
	ttt.toString = function(){
        var os = "\n\n[";
        for(var i =0; i<3; i++){
            for (var j=0; j<3; j++){
                os += board[i][j]; 
                if (j != 2)
                    os += ", ";
            }
            os += "]\n"; 
            if (i != 2)
                os+="[";
        }
        os += "\n\n";
        return os;
	};
};

module.exports = ttt;