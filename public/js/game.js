var start;
var messageRecieved = true;
var id;
var label;
var buttons = [];
var text;
var canPlay = true;

var ws = new WebSocket('ws://chrisds.koding.io:3000/game');
// var ws = new WebSocket('ws://localhost:3000/game');

var message = ''; //will hold response from server

function elt(id){
    return document.getElementById(id);
}

ws.onopen = function() {
    var msg = {status: "Connection good.", firstConnection: true};
    ws.send(JSON.stringify(msg));
    var msg  = {cmd: "post message", value: ":Welcome [username here]!"};
    ws.send(JSON.stringify(msg));
};

ws.onmessage = function(event) {
    messageRecieved = true;
    // var end = window.performance.now();
    // console.log("time: " + (end-start));
    message = JSON.parse(event.data);
    console.log("from ws.onmessage: ",message);
    if (message.cmd === 'post message'){
        addChatMessage(message);
    }
    if (message.label){
        id = message.id;
        label = message.label;
        if (message.label === 'spectator'){
            canPlay = false;
        }
        if (message.gameStarted){
            displayPastMoves(message);
        }
    }
    else if(message.update){
        changeFrame(message);
        // console.log(buttons[message.buttonIndex]);
        if (message.gameOver){
            endGame(message.result);
        }
    }
};

function postMessage (){
    // console.log("clicked");
    var text = elt("chatText").value;
    elt("chatText").value = "";
    text = text.replace(/\r?\n/g, '<br>');
    var msg  = {cmd: "post message", value: '[sender username]:' + text.trim()};
    ws.send(JSON.stringify(msg));
}

function keyPress(){
    e = window.event;
    console.log(e.key);
    if (e.key === 'Enter'){
        console.log("pressed enter");
        elt('chatButton').click();
    }
}

function addChatMessage (message){
    var messageList = elt("chat-list");
    
    var new_message = elt('message-template').content.cloneNode(true);
    new_message.querySelector(".message-text").innerHTML = message.value;
    
    messageList.appendChild(new_message);
    
    if(message.value !== ""){
        elt("chatText").focus();
    }
    messageList.scrollTop = messageList.scrollHeight;
}

ws.onclose = function() {
    var msg = {status: "Connection is closed..."};
    ws.send(JSON.stringify(msg));
};

//  function run() {
    var game = new Phaser.Game(700, 500, Phaser.AUTO, 'TTT', { preload: preload, create: create});
    console.log("game Made");
    var background;
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
        if (!gameOver && canPlay && messageRecieved){
            var msg = {cmd: 'play move', row: button.row, col: button.col, playerLable: label};
            // start = window.performance.now();
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
        console.log("index: "+message.buttonIndex);
        var frame = message.buttonFrame;
        console.log("frame is: "+ frame);
        console.log("typeof frame: "+typeof frame);
        buttons[message.buttonIndex].frame = frame;
    }

    function displayPastMoves(message){
        console.log("GAME STARTED ALREADY");
        for (var i = 0; i < message.pastMoves.length; i++){
            // console.log("button index: ",message.pastMoves[i].buttonIndex);
            // console.log("frame is: ",message.pastMoves[i].buttonFrame);
            buttons[message.pastMoves[i].buttonIndex].frame = message.pastMoves[i].buttonFrame;
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