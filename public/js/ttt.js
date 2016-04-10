var ttt = {};

ttt.board = [["","",""], ["","",""], ["","",""]];
ttt.ROWS  = 3;
ttt.COLS  =  3;

ttt.reset = function(){
    for (var i = 0; i < ttt.ROWS; i++) {
        for (var j = 0; j < ttt.COLS; j++){
            ttt.board[i][j] = "";
        }
    }
};

ttt.checkWin = function(){
    var winner = "";
    // Horizontal win
    for (var i = 0; i < ttt.ROWS; i++)
        if (ttt.board[i][0] == ttt.board[i][1] && ttt.board[i][1] == ttt.board[i][2])
            if (ttt.board[i][0] !== ""){
                winner = ttt.board[i][0];
            }
    // Vertical win
    for (i = 0; i < ttt.COLS; i++)
        if (ttt.board[0][i] == ttt.board[1][i] && ttt.board[1][i] == ttt.board[2][i])
            if (ttt.board[0][i] !== ""){
                 winner = ttt.board[0][i];
            }
    // Diagonol win
    if ((ttt.board[0][0] == ttt.board[1][1] && ttt.board[1][1] == ttt.board[2][2]) || 
        (ttt.board[0][2] == ttt.board[1][1] && ttt.board[1][1] == ttt.board[2][0]))
            if (ttt.board[1][1] !== ""){
                winner = ttt.board[1][1];
            }
    return winner;
};

ttt.playMove = function(row, col, token){
    var validMove = false;
    if (ttt.board[row][col] === ""){
        ttt.board[row][col] = token;
        validMove = true;
    }
    return validMove;
};

ttt.toString = function(){
    var os = "\n\n[";
    for(var i =0; i<3; i++){
        for (var j=0; j<3; j++){
            os += ttt.board[i][j]; 
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


module.exports = ttt;