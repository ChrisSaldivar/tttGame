var ws = new WebSocket('ws://chrisds.koding.io:3000/game');
// var ws = new WebSocket('ws://localhost:3000/game');

var start;
var id;
var label;
var text;
var canPlay = false;
var seconds = 10;
var interval;

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
    if (message.updateLeaderBoard)
        console.log("from ws.onmessage: ",message);

    if (message.redirect){
        window.location = message.url;
    }
    else if (message.value){
        addChatMessage(message);
    }
    else if (message.cmd === "hello"){
        sayHello(message.user);
    }
    else if (message.cmd === 'text message result'){
        showTextMessageResult(message);
    }
    else if(message.update){
        clearInterval(interval);
        seconds = 10;
        time.setText('');
        changeFrame(message);
        // console.log(buttons[message.buttonIndex]);
        if (message.gameOver){
            canPlay = false;
            endGame(message.result);
        }
    }
    else if (message.updateLeaderBoard){
        updateLeaderBoard(message);
    }
    else if (message.canPlay){
        canPlay = true;
    }
    if (message.timer){
        interval = setInterval(timer, 1000);
    }
    if (message.gameStarted){
        displayPastMoves(message);
        if (message.canPlay){
            canPlay = true;
        }
    }
};

function timer (){
    updateTime();
    if (seconds < 0){
        clearInterval(interval);
        ws.send(JSON.stringify({outOfTime: true}));
        seconds = 10;
    }
}

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
    for (var i = 0; i < message.board.length+1; i++){
        var new_leader = elt('leaderboard-template').content.cloneNode(true);
        if (i === 0){
            new_leader.querySelector(".leaderboard-text").innerHTML = '<center id=center1><strong>Leaderboard</strong></center><br/>';
        }
        else if (message.board[i-1]){
            if (i === 10){
                new_leader.querySelector(".leaderboard-text").innerHTML = i + "." + '<center id=center2>' + message.board[i-1].name + '-' + message.board[i-1].wins + '</center>';
            }
            else{
                new_leader.querySelector(".leaderboard-text").innerHTML = i + ". &nbsp" + '<center id=center2>' + message.board[i-1].name + '-' + message.board[i-1].wins + '</center>';
            }
        }
        else{
            new_leader.querySelector(".leaderboard-text").innerHTML = i + '.';
        }
        leaderboard.appendChild(new_leader);
    }
}

function showShareMessage(){
    var share = elt("share");
    share.style.display = 'block';
}

function hideShareMessage(){
    var share = elt("share");
    share.style.display = 'none';
}

function showNumberPrompt(){
    var share = elt("number-prompt");
    share.style.display = 'block';
}

function hideNumberPrompt(){
    var share = elt("number-prompt");
    share.style.display = 'none';
}

function sendTextMessage(){
    var msg = {
        cmd: 'sendTextMessage',
        number: elt("numberText").value,
        id: id
    };
    ws.send(JSON.stringify(msg));
}

function showTextMessageResult(msg){
    hideNumberPrompt();
    var div1 = elt("textmessage-response");
    var div2 = elt("textmessage-span");
    if (msg.success){
        div2.innerHTML = "<center>Message Sent</center>";
    }
    else{
        div2.innerHTML = "<center>Message Failed To Send</center>";
    }   
    div1.style.display = 'block';
    setInterval(function(){div1.style.display = 'none'}, 1500);
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