// var ws = new WebSocket('ws://chrisds.koding.io:3000/game');
var ws = new WebSocket('ws://localhost:3000/game');

var start;
var messageRecieved = true;
var id;
var label;
var buttons = [];
var text;
var canPlay = true;

function getLeaderBoard(){
    var msg = {};
    msg.cmd = 'update leaderboard';
    ws.send(JSON.stringify(msg));
}

var message = ''; //will hold response from server

function elt(id){
    return document.getElementById(id);
}

ws.onopen = function() {
    id = localStorage.getItem('id');
    var msg = {cmd: "open", id: id};
    ws.send(JSON.stringify(msg));
};

ws.onmessage = function(event) {
    messageRecieved = true;
    // var end = window.performance.now();
    // console.log("time: " + (end-start));
    message = JSON.parse(event.data);
    console.log("from ws.onmessage: ",message);
    
    if (message.redirect){
        window.location = message.url;
    }
    else if (message.value){
        console.log("post");
        addChatMessage(message);
    }
    else if (message.cmd === "hello"){
        sayHello(message.user);
    }
    else if (message.label){
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
    else if (message.updateLeaderBoard){
        updateLeaderBoard(message);
    }
};

function postMessage (){
    console.log(localStorage.getItem('id'));
    var text = elt("chatText").value;
    elt("chatText").value = "";
    text = text.replace(/\r?\n/g, '<br>');
    var msg  = {
        cmd: "post message", 
        value: text.trim(),
        id: localStorage.getItem('id')
    };
    ws.send(JSON.stringify(msg));
}

function sayHello(message){
    var messageList = elt("chat-list");
    
    var new_message = elt('message-template').content.cloneNode(true);
    new_message.querySelector(".message-text").innerHTML = "Welcome, " + message + ": ";
    
    messageList.appendChild(new_message);
    
    if(message.value !== ""){
        elt("chatText").focus();
    }
    messageList.scrollTop = messageList.scrollHeight;
}

function addChatMessage (message){
    var messageList = elt("chat-list");
    
    var new_message = elt('message-template').content.cloneNode(true);
    new_message.querySelector(".message-text").innerHTML = "[" + message.senderName + "]: " + message.value;
    
    messageList.appendChild(new_message);
    
    if(message.value !== ""){
        elt("chatText").focus();
    }
    messageList.scrollTop = messageList.scrollHeight;
}

function updateLeaderBoard(message){
    var leaderboard = elt("leaderboard-list");


    while(leaderboard.firstChild){ //clear old leader board
        leaderboard.removeChild(leaderboard.firstChild);
    }
    for (var i = 0; i < 11; i++){
        var new_leader = elt('leaderboard-template').content.cloneNode(true);
        if (i === 0){
            new_leader.querySelector(".leaderboard-text").innerHTML = '<center id=center1><strong>Leaderboard</strong></center><br/>';
        }
        else if (message[i]){
            if (i === 10){
                new_leader.querySelector(".leaderboard-text").innerHTML = i + "." + '<center id=center2>' + message[i] + '</center>';
            }
            else{
                new_leader.querySelector(".leaderboard-text").innerHTML = i + ". &nbsp" + '<center id=center2>' + message[i] + '</center>';
            }
        }
        else{
            new_leader.querySelector(".leaderboard-text").innerHTML = i + '.';
        }
        leaderboard.appendChild(new_leader);
    }
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