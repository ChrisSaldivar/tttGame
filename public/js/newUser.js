var ws = new WebSocket('ws://chrisds.koding.io:3000/newUser');
//   var ws = new WebSocket('ws://localhost:3000/newUser');


function submitInfo(){
    var message = {
        cmd:      'register',
        username: 'user',
        password: 'pass'
    };
    message.username = elt("username").value.trim();
    message.password = elt("password").value;
    ws.send(JSON.stringify(message));
}

ws.onopen = function() {
    var msg = {status: "Connection good."};
    ws.send(JSON.stringify(msg));
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
    window.location = msg.url;
}

function displayError(){
    alert("Name taken");
    elt("username").value = "";
    elt("password").value = "";
}