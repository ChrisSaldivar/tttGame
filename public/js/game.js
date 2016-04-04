var ws = new WebSocket('ws://chrisds.koding.io:3000/game');
var message = ''; //will hold response from server

ws.onopen = function() {
    var msg = {status: "Connection good."};
    ws.send(JSON.stringify(msg));
};

ws.onmessage = function(event) {
    
    message = JSON.parse(event.data);
    console.log("from ws.onmessage: ",message);
    changeFrame(message);
    
    // if (message.type === 'play move') {
    //     console.log("from changeFrame: ",message);
    //     if (message.movePlayed){
    //         var frame = message.buttonFrame;
    //         console.log("frame: "+frame);
    //         button.setFrames(frame);
    //         console.log("Frame Change");
    //     }
    // }
    
    // if (message.type === 'check win'){
    //     console.log("\nfrom actionOnClick: ",message);
    //     endGame(message.result);
    //     changeFrame(button);
    // }
    
    endGame(message);
    
    // var msg = {status: "Message Recieved."};
    // ws.send(JSON.stringify(msg));
}

ws.onclose = function() {
    var msg = {status: "Connection is closed..."};
    ws.send(JSON.stringify(msg));
}

//  function run() {
    var game = new Phaser.Game(700, 500, Phaser.AUTO, 'TTT', { preload: preload, create: create});

    var background;
    var buttonClicked;
    var gameOver = false;

    function create (){
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
                button.name = "Button " + (j + 3*i + 1);
                button.col = i;
                button.row = j;
                x += 150;
            }
            x = 150;
            y += 150;
        }
    }

    function actionOnClick(button){
        if (!gameOver){
            buttonClicked = button;
            var msg = {cmd: 'play move', row: button.row, col: button.col};
            waitForSocketConnection(ws, function() {ws.send(JSON.stringify(msg))});
    
            
            /*waitForSocketConnection(ws, function() {message = JSON.parse(message)});
            console.log("\nfrom actionOnClick: ",message);
            endGame(message.result);

            changeFrame(button);*/
            // if (message[0] === "tie"){
            //     endGame("It's a tie");
            // }
            // else if (message[0] === "win") {
            //     endGame("winner is: " + message[1]);
            // }
            
        }
    }

    function endGame(message){
        if (message.gameOver){
            gameOver = true;
            game.add.text(game.world.centerX, game.world.centerY, message.result, { font: "65px Arial", fill: "#ff0044", align: "center" });
            setTimeout(reset, 3000);
        }
    }

    function changeFrame(message){
        
        console.log("from changeFrame: ",message);
        if (message.movePlayed){
            var frame = message.buttonFrame;
            console.log("frame: "+frame);
            buttonClicked.setFrames(frame);
            console.log("Frame Change");
        }
        
    }

    function reset(){
        var msg = {cmd: 'reset'};
        waitForSocketConnection(ws, function() {
            ws.send(JSON.stringify(msg));
            console.log('done');
            create();
        });
    }
//  }

window.onload = run;

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback){
     setTimeout(
         function () {
            if (socket.readyState === 1) {
                console.log("Connection is made")
                if(callback !== null){
                    callback();
                }
                return;

            } else {
                console.log("wait for connection...")
                waitForSocketConnection(socket, callback);
            }

         }, 5); // wait 5 milisecond for the connection...
}