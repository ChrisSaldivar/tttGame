var Users = require(__dirname + '/db/databaseModel.js');
var ttt   = require(__dirname + '/public/js/ttt.js');

//server using express beginning of project
var express     = require('express');
var app         = express(); //create express object
var expressWs   = require('express-ws')(app); //create express websocket extension
var password    = require('password-hash-and-salt'); //used for hashing password


var tempUsers = [];

var gameStarted = false;
var firstGame   = true;

var User = Users();
User.init();

app.ws('/auth', function(ws, req) { //route for checking user login
    
    //check for valid login
    ws.on('message', function(msg){
        msg = JSON.parse(msg);
        console.log("msg: ", msg);
        if (msg.cmd === 'login'){
            User.verifyUser(msg.username, msg.password, ws);
        }
        else if (msg.cmd === 'open'){
            var user = User.clients[msg.id];
            if (user && user.expire > Date.now()){
                user.expire = Date.now() + 1000*60*60;
                var res = { 
                    redirect: true,
                    url:  'http://chrisds.koding.io/main.html'
                    //  url:  'http://localhost:3000/main.html'
                };
                ws.send(JSON.stringify(res));
            }
        }
        else if (msg.cmd === 'choose players'){
            choosePlayers(2);
            // console.log("\n",players);
            // console.log("player1", player1);
            // console.log("player2", player2);
            // console.log(Object.keys(User.clients).length);
            makeArray();
            tempUsers.sort(compare); 
            for (var i=0; i<tempUsers.length; i++){
                console.log(tempUsers[i].username,"--",tempUsers[i].plays);
            }
        }
    });
    
});

app.ws('/newUser', function(ws, req) { //route for checking new user login
    
    // Register new user
    ws.on('message', function(msg){
        console.log(msg);
        msg = JSON.parse(msg);
        
        if (msg.cmd === 'register'){
            password(msg.password).hash(function(error, hash) {
                if(error)
                    throw new Error('Something went wrong!');
                
                delete msg.password;
                // Store hash (incl. algorithm, iterations, and salt) 
                msg.hash = hash;
                User.add(msg.username, msg.hash, ws);
            });
            
        }
    });
    
});

var moveNumber     = 1;
var pastMoves      = Array();
var player1;
var player2;
var afk     = {};
var players = {};
var temp    = {};

function Move (frame, index){
    this.buttonFrame = frame;
    this.buttonIndex = index;
}

app.ws('/game', function(ws, req) { //socket route for game requests

    ws.on('close', function(code, msg){
        // removeUser();
    });

    //for game
    ws.on('message', function(msg) {

        msg = JSON.parse(msg);
        console.log(msg);

        // console.log("\n\nClients", User.clients);
        if (msg.cmd === 'open'){
            var good = false;
            var user = User.clients[msg.id];
            if (user && user.expire > Date.now()){
                delete User.clients[msg.id].ws;
                User.clients[msg.id].ws = ws;
                user.expire = Date.now() + 1000*60*60;
                User.showLeaderBoard(ws);
                good = true;
            }
            else{
                var res = {
                    redirect: true,
                    url:  'http://chrisds.koding.io/index.html'
                    // url: 'localhost:3000/index.html'
                };
                ws.send(JSON.stringify(res));
            }

            if (good){
                var res = {
                    cmd: "hello",
                    user: User.clients[msg.id].username
                };
                ws.send(JSON.stringify(res));
            }
            if (gameStarted){
                var res = {
                    pastMoves   : pastMoves,
                    gameStarted : gameStarted,
                };
                if (players[msg.id]){     // if a current player reloads/new tab etc.
                    res.canPlay = true;
                }
                ws.send(JSON.stringify(res));
            }
            if (Object.keys(User.clients).length > 1 && firstGame){
                startGame();
            }
        }
        else if (msg.cmd === 'sendTextMessage'){
            User.sendTextMessage(msg.number, User.clients[msg.id].username, ws);
        }
        else if (msg.cmd === 'text message result'){
            ws.send(msg);
        }
        else if (msg.cmd === 'post message'){
            if (msg.value){
                var username;
                if (User.clients[msg.id]){
                    username = User.clients[msg.id].username;
                }
                else if (players[msg.id]){
                    username = players[msg.id].username;
                }
                var res = {
                    value: msg.value,
                    senderName: username
                };
                console.log("post message",res);
                broadcast(res);
            }
        }
        else if (msg.cmd === 'update leaderboard'){
            User.showLeaderBoard(ws);
        }
        else if (msg.status){
            console.log("Status: " + msg.status);
        }
        else if (msg.cmd === 'play move'){
            var res = {
                buttonIndex: -1,
                update:      false,
                buttonFrame: -1,
                gameOver:    false,
                result:      ""
            };
            buttonRow    = msg.row;
            buttonCol    = msg.col;
            index        = buttonRow * 3 + buttonCol;

            // Attempt to play the move
            var currToken = (moveNumber % 2 !== 0) ? 'X' : 'O';
            if (currentPlayer(msg.id, currToken) && ttt.playMove(buttonRow, buttonCol, currToken)){
                playMove(index, res, currToken);
            }
            // Check if game is over and report results
            if (res.update){
                checkGameOver(res);
            }

            console.log(ttt.toString());

            broadcast(res);
        }
    });
});

function currentPlayer (id, currToken){
    if (players[id] && players[id].token === currToken){
        return true;
    }
    return false;
}

function removeUser (){
    var id;
    for (id in User.clients){
        if (User.clients[id].ws.readyState == 3){
            
        }
    }
}

function playMove (index, res, currToken){
    gameStarted = true;
    res.buttonIndex = index;
    var frame = (currToken === "X") ? 1 : 2;
    pastMoves.push(new Move(frame, index));
    res.update = true;
    res.buttonFrame = frame;
    moveNumber++;
}

function checkGameOver (res){
    var winner = ttt.checkWin();
    // var player1 = players[0];
    // var player2 = players[1];
    if (winner === "" && moveNumber == 10){
        /*
            player1.losses++;
            player2.losses++;
        */
        res.result   = 'It\'s a tie';
        res.gameOver = true;
    }
    else if (winner !== ""){
        /*
            if (winner === 'X'){
                player1.wins++;
                player2.losses++;
            }
            else{
                player2.wins++;
                player1.losses++;
            }
        */
        res.result = 'Winner is: ' + winner;
        res.gameOver = true;
    }
    if (res.gameOver){
        /*
            player1.plays++;
            player2.plays++;
            updateWinsandLosses(player1.name, player1.wins, player1.loses, player1.plays);
            updateWinsandLosses(player1.name, player2.wins, player2.loses, player2.plays);
        */
        reset();
    }
}

function broadcast (res){
    // console.log("\n\nbroadcast clients: ", User.clients, "\n\n");
    for (var id in User.clients){
        if (User.clients[id].expire < Date.now()){
            delete User.clients[id];
        }
        else{
            if (User.clients[id].ws.readyState == 1)
                User.clients[id].ws.send(JSON.stringify(res));
        }
    }
    for (var id in players){
        if (players[id].ws.readyState == 1)
                players[id].ws.send(JSON.stringify(res));
    }
}

function reset(){
    moveNumber     = 1;
    gameStarted    = false;
    pastMoves      = Array();
    // choosePlayers(2);
    ttt.reset();
}

// Sort clients based on times played 
function compare (a, b){
    if (a.plays < b.plays){
        return -1;
    }
    if (a.plays > b.plays){
       return 1;
    }
    return 0;
}

// choose random group based on pareto principle
function pareto(){
    var r = Math.random() * (100 - 1) + 1; // random number from [1,100)
    if (r <= 82.7){
        return 0;
    }
    else if (r > 82.7 && r <= 94.45){
        return 1;
    }
    else if (r > 94.45 && r <= 96.75){
        return 2;
    }
    else if (r > 96.75 && r <= 98.6){
        return 3;
    }
    return 4;
}

/*
    Returns a weighted random index in User.clients
    
    clients is order in ascending order based on times played
    lowest  20%	-- 82.70% chance of playing
    Second  20%	-- 11.75% chance of playing
    mid     20%	-- 2.30%  chance of playing
    Fourth  20%	-- 1.85%  chance of playing
    highest 20%	-- 1.40%  chance of playing
*/
function weightedRandom (){
    tempUsers.sort(compare); 
    var group = pareto();
    var range = Math.floor(tempUsers.length * 0.20);
    var min   = range * group;
    var max   = range * (group + 1);
    if (group == 4)
        max = tempUsers.length;
    return Math.floor(Math.random() * (max - min)) + min;
}

function unWeightedRandom(){
    return Math.floor(Math.random() * (Object.keys(User.clients).length));
}

function choosePlayers (numPlayers){
    var rand = (Object.keys(User.clients).length < 5) ? unWeightedRandom : weightedRandom; // weightedRandom only works with 5+ indices
    removePlayers();                                         // Move losing players to temp array (so they aren't chosen again)
    var done = false;
    for (var i = 0; i < numPlayers && !done; i++){                    // choose new players and add them to players array
        makeArray();
        if (tempUsers.length > 0){
            var index = rand();
            var key   = tempUsers[index].id;
            players[key] = User.clients[key];
            delete User.clients[key];
            tempUsers = [];
        }
        else{
            if (Object.keys(players).length === 0){ // no other players to choose from
                players = temp; // previous players get to play again
                done = true;
            }
            else if (Object.keys(temp).length == 2){
                var newPlayerId = (temp[player1].plays < temp[player2].plays) ? player1 : player2;
                players[newPlayerId] = temp[newPlayerId];
                delete temp[newPlayerId];
            }
        }
    }
    moveTempToClients();                                    // Add losing players back to User.clients
    // Save keys for the 2 current players
    // console.log("Players", players);
    var keys = Object.keys(players);
    player1  = keys[0];
    player2  = keys[1];
    players[player1].token = 'X';
    players[player2].token = 'O';
}


function startGame(){
    choosePlayers(2);
    for (var id in players){
        if (players[id].ws.readyState == 1){
            console.log("player");
            var msg = {canPlay: true};
            players[id].ws.send(JSON.stringify(msg));
        }
    }
}

function makeArray (){
    for (var id in User.clients){
        var user = User.clients[id];
        user.id = id;
        tempUsers.push(user);
    }
}

function removePlayers (){
    for (var id in players){
        players[id].loser = true;
        if (players[id].loser){
            delete players[id].loser;
            temp[id] = players[id];
            delete players[id];
        }
    }
}

function moveTempToClients (){
    for (var id in temp){
        User.clients[id] = temp[id];
    }
    temp = {};
}

app.use('/', express.static(__dirname + '/public')); //route to serve static login page

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
