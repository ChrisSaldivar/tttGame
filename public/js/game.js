var game = new Phaser.Game(700, 500, Phaser.AUTO, 'TTT', { preload: preload, create: create});
var background;
var gameOver = false;
var buttons = [];
var time;

function create (){
    console.log("Creating");
    gameOver = false;
    background = game.add.tileSprite(0, 0, 700, 500, 'background');
    time = game.add.text(50, 50, '', { font: "40px Arial", fill: "#ff0044", align: "center" });
    buttons = Array();
    generateButtons();

}

function preload(){
    game.load.spritesheet('button', 'assets/button_spritesheet.png', 105, 90, 3);
    game.load.image('background','assets/board.png');
}

function generateButtons(){
    var button;
    var x = 150;
    var y = 75;
    gameOver = false;
    buttons = Array();
    for (var i = 0; i < 3; i++){
        for (var j=0; j<3; j++){
            button = game.add.button(x, y, 'button', actionOnClick, this);
            button.col = j;
            button.row = i;
            buttons.push(button);
            x += 150;
        }
        x = 150;
        y += 150;
    }
}

function actionOnClick(button){
    if (!gameOver && canPlay){
        clearInterval(interval);
        seconds = 10;
        time.setText('');
        var msg = {cmd: 'play move', row: button.row, col: button.col, id: id};
        // start = window.performance.now();
        waitForSocketConnection(ws, function() {ws.send(JSON.stringify(msg))});
        
    }
}

function endGame(message){
    seconds = 10;
    clearInterval(interval);
    gameOver = true;
    text = game.add.text(game.world.centerX, game.world.centerY, message, { font: "65px Arial", fill: "#ff0044", align: "center" });
    setTimeout(reset, 2000);
}

function updateTime(){
    time = time.setText(seconds--);
}

function changeFrame(message){
    if (message.buttonFrame){
        var frame = message.buttonFrame;
        buttons[message.buttonIndex].frame = frame;
    }
}

function displayPastMoves(message){
    for (var i = 0; i < message.pastMoves.length; i++){
        // console.log("button index: ",message.pastMoves[i].buttonIndex);
        // console.log("frame is: ",message.pastMoves[i].buttonFrame);
        buttons[message.pastMoves[i].buttonIndex].frame = message.pastMoves[i].buttonFrame;
    }
}

function reset(){
    getLeaderBoard();
    create();
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback){
     setTimeout(
         function () {
            if (socket.readyState === 1) {
                console.log("Connection is made");
                if(callback !== null){
                    callback();
                }
                return;

            } else {
                console.log("wait for connection...");
                waitForSocketConnection(socket, callback);
            }

         }, 5); // wait 5 milisecond for the connection...
}