var ws = new WebSocket('ws://chrisds.koding.io:3000/auth');

function submitInfo(){
    var message = {
        cmd:      'login',
        username: 'user',
        password: 'pass'
    };
    ws.send(message);
}

ws.onopen = function() {
    var msg = {status: "Connection good."};
    ws.send(JSON.stringify(msg));
};

ws.onmessage = function(event) {
    var msg = JSON.parse(event.data);
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
    window.location = msg.url;
}

function displayError(){
    
}