var start;
var messageRecieved = true;
var id;
var label;
var buttons = [];
var text;
var canPlay = true;



//var ws = new WebSocket('ws://chrisds.koding.io:3000/game');
  var ws = new WebSocket('ws://localhost:3000/game');

var message = ''; //will hold response from server

function elt(id){
    return document.getElementById(id);
}

ws.onopen = function() {
    id = localStorage.getItem('id');
    var msg = {cmd: "open", id: id};
    ws.send(JSON.stringify(msg));
    // msg  = {cmd: "post message", value: ":Welcome [username here]!"};
    // ws.send(JSON.stringify(msg));
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