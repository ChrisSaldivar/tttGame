var game = new Phaser.Game(800, 600, Phaser.AUTO, 'TTT', { preload: preload, create: create});


function preload(){
	game.load.spritesheet('button', 'assets/button_spritesheet.png', 105, 90, 3);
	game.load.image('background','assets/board.png');
}

var background;
var currentPlayer = "X";
var moveNumber = 1;
var gameOver = false;

function create (){
    gameOver = false;
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
    if (!gameOver){
        changeFrame(button);
        var winner = ttt.checkWin();
        if (winner === "" && moveNumber == 10){
            endGame("It's a tie");
        }
        else if (winner !== ""){
            endGame("winner is: " + winner);
            
        }
    }
}

function endGame(message){
    game.add.text(game.world.centerX, game.world.centerY, message, { font: "65px Arial", fill: "#ff0044", align: "center" });
    setTimeout(reset, 3000);
    moveNumber = 1;
    currentPlayer = "X";
    gameOver = true;
}

function changeFrame(button){
    if (ttt.playMove(button.row, button.col, currentPlayer)){
        var frame = (currentPlayer === "X") ? 1 : 2;
        button.setFrames(frame);
        currentPlayer = (currentPlayer === "X") ? "O" : "X";
        moveNumber++;
	}
}

function reset(){
    ttt.reset();
    create();
}