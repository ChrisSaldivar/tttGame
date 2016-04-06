var start;
var messageRecieved = true;
var id;
var buttons = [];
var text;

var ws = new WebSocket('ws://localhost:3000/game');
var message = ''; //will hold response from server

ws.onopen = function() {
    var msg = {status: "Connection good.", firstConnection: true};
    ws.send(JSON.stringify(msg));
};

ws.onmessage = function(event) {
    messageRecieved = true;
    var end = window.performance.now();
    // console.log("time: " + (end-start));
    message = JSON.parse(event.data);
    console.log("from ws.onmessage: ",message);
    if (message.id){
        id = message.id;
        if (message.gameStarted){
            console.log("GAME STARTED ALREADY");
            for (var i=0; i<message.pastMoves.length; i++){
                // console.log("button index: ",message.pastMoves[i].buttonIndex);
                // console.log("frame is: ",message.pastMoves[i].buttonFrame);
                buttons[message.pastMoves[i].buttonIndex].frame = message.pastMoves[i].buttonFrame;
            }
        }
    }
    else if(message.update){
        console.log("index: "+message.buttonIndex);
        var aFrame = message.buttonFrame;
        // console.log("frame is: "+ frame);
        // console.log("typeof frame: "+typeof frame);
        buttons[message.buttonIndex].frame = aFrame;
        // console.log(buttons[message.buttonIndex]);
        if (message.gameOver){
            endGame(message.result);
        }
    }
};

ws.onclose = function() {
    var msg = {status: "Connection is closed..."};
    ws.send(JSON.stringify(msg));
};

//  function run() {
    var game = new Phaser.Game(700, 500, Phaser.AUTO, 'TTT', { preload: preload, create: create});
    console.log("game Made");
    var background;
    var buttonClicked;
    var gameOver = false;

    function create (){
        console.log("Creating");
        gameOver = false;
        background = game.add.tileSprite(0, 0, 700, 500, 'background');
        
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
        if (!gameOver && messageRecieved){
            buttonClicked = button;
            var msg = {cmd: 'play move', row: button.row, col: button.col, playerId: id};
            start = window.performance.now();
            messageRecieved = false;
            waitForSocketConnection(ws, function() {ws.send(JSON.stringify(msg))});
            
        }
    }

    function endGame(message){
        gameOver = true;
        text = game.add.text(game.world.centerX, game.world.centerY, message, { font: "65px Arial", fill: "#ff0044", align: "center" });
        setTimeout(reset, 3000);
    }

    function changeFrame(message){
        
        // console.log("from changeFrame: ",message);
        if (message.movePlayed){
            var frame = message.buttonFrame;
            console.log("frame: "+frame);
            buttonClicked.frame = frame;
            // console.log("Frame Change");
        }
        
    }

    function reset(){
        buttons = Array();
        create();
    }
//  }

window.onload = console.log("loading");

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