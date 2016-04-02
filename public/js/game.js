var ws = new WebSocket('ws://localhost:3000/game');
var message = ''; //will hold response from server
ws.onopen = function() {
    ws.send("Connection good.");
};

ws.onmessage = function(event) {
    message = event.data;
    console.log(message);
    ws.send("Message Recieved.");
}

ws.onclose = function() {
    ws.send("Connection is closed...");
}

function run() {
    var game = new Phaser.Game(700, 500, Phaser.AUTO, 'TTT', { preload: preload, create: create});

    var background;
    
    var gameOver = false;

    function create (){
       waitForSocketConnection(ws, function() {ws.send('create')//});
       gameOver = false;
       background = game.add.tileSprite(0, 0, 700, 500, 'background');
    
	   generateButtons();
        });
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
            x = 150
            y += 150;
        }
    }


    function actionOnClick(button){
        if (!gameOver){
            changeFrame(button);
            waitForSocketConnection(ws, function() {ws.send("check win")});
    
            waitForSocketConnection(ws, function() {
                message = String(message).split(',');
                if (message[0] === "tie"){
                    endGame("It's a tie");
                }
                else if (message[0] === "win") {
                    endGame("winner is: " + message[1]);
                }
            });
            //changeFrame(button);
        }
    }

    function endGame(message){
        gameOver = true;
        waitForSocketConnection(ws, function() {ws.send("end of game")});
        game.add.text(game.world.centerX, game.world.centerY, message, { font: "65px Arial", fill: "#ff0044", align: "center" });
        setTimeout(reset, 3000);
    }

    function changeFrame(button){
        waitForSocketConnection(ws, function() {ws.send("play move," + button.row + "," + button.col)//});
    
        message = String(message).split(',');
        if (message[0] === 'true'){
            var frame = parseInt(message[1]);
            console.log(frame);
            button.setFrames(frame);
        }
        });
    }

    function reset(){
        waitForSocketConnection(ws, function() {ws.send('reset')
        console.log('done')
        create();
        });
    }
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                console.log("Connection is made")
                if(callback != null){
                    callback();
                }
                return;

            } else {
                console.log("wait for connection...")
                waitForSocketConnection(socket, callback);
            }

        }, 5); // wait 5 milisecond for the connection...
}