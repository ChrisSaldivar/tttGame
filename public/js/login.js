//var ws = new WebSocket('ws://chrisds.koding.io:3000/auth');
var ws = new WebSocket('ws://localhost:3000/auth');

 var id = localStorage.getItem('id');

function submitInfo(){
    var message = {
        cmd:      'login',
        username: 'user',
        password: 'pass'
    };
    message.username = elt("username").value.trim();
    message.password = elt("password").value;
    ws.send(JSON.stringify(message));
}

ws.onopen = function() {
    
    if (id != null){
       
        var msg = {cmd: 'open', id: id};
        console.log("open sending:", msg);
        ws.send(JSON.stringify(msg));
    }
};

ws.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    elt("username").value = "";
    elt("password").value = "";
    console.log(msg);
    if (msg.redirect){
        redirect(msg);
    }
    else{
        displayError();
    }
};

function elt(id){
    return document.getElementById(id);
}


function redirect(msg){
    console.log(msg.url);
    if (msg.id){
        localStorage.setItem('id', msg.id);
        console.log(msg.id);
    }
    //window.location = msg.url;
}

function displayError(){
    alert("Invalid login");
}