var game = new Phaser.Game(800, 600, Phaser.AUTO, 'TTT', { preload: preload, create: create});


function preload(){
	game.load.spritesheet('button', 'assets/button_spritesheet.png', 105, 90, 3);
	game.load.image('background','assets/board.png');
}

var background;
var currentPlayer = "X";


function create (){

    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    
	generateButtons();

}

function generateButtons(){
    var button;
    var x = 150;
    var y = 75;
    for (var i = 0; i < 3; i++){
        for (var j=0; j<3; j++){
            button = game.add.button(x, y, 'button', actionOnClick, this);
            button.name = "Button " + (j + 3*i + 1);
            button.col = i;
            button.row = j;
            x += 150;
        }
        x = 150
        y += 150;
    }
}

function actionOnClick(button){
	changeFrame(button);
	var winner = ttt.checkWin();
	if (winner !== ""){
        game.add.text(game.world.centerX, game.world.centerY, "winner is: " + winner, { font: "65px Arial", fill: "#ff0044", align: "center" });
        setTimeout(reset, 3000);
	}
}

function changeFrame(button){
    if (ttt.playMove(button.row, button.col, currentPlayer)){
        var frame = (currentPlayer === "X") ? 1 : 2;
        button.setFrames(frame);
        currentPlayer = (currentPlayer === "X") ? "O" : "X";
	}
}

function reset(){
    ttt.reset();
    create();
}

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