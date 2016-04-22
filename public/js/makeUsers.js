// var ws = new WebSocket('ws://chrisds.koding.io:3000/newUser');
  var ws = new WebSocket('ws://localhost:3000/newUser');

var numUsers;

window.onload = function(){
    numUsers = elt('num').value;
};

function makeUsers (){
    var msg = {
        cmd: "register",
        password: "pass"
    };
    for (var i = 0; i < numUsers; i++){
        msg.username = "user" + (i+1);
        ws.send(JSON.stringify(msg));
    }
}

function loginUsers(){
    // ws = new WebSocket('ws://chrisds.koding.io:3000/auth');
    ws = new WebSocket('ws://localhost:3000/newUser');
    ws.onopen = function (){
        var msg = {
            cmd: "login",
            password: "pass"
        };
        for (var i = 0; i < numUsers; i++){
            msg.username = "user" + (i+1);
            ws.send(JSON.stringify(msg));
        }
    };
}

var registeredUsers = 0;

ws.onmessage = function(event) {
    registeredUsers++;
    console.log(registeredUsers);
    if (registeredUsers == 100){
        elt('numUsers').innerText = numUsers + " users registered";
    }
};

function elt(id){
    return document.getElementById(id);
}

function choosePlayers(){
    msg = {cmd: "choose players"};
    ws.send(JSON.stringify(msg));
}
