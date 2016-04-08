var Users = function(){
    Users.sqlite3 = require('sqlite3').verbose();
    Users.db      = new Users.sqlite3.Database('users.db'); //open or create database
    Users.init    = function(ws){
        Users.db.serialize(function(){
            Users.db.run('CREATE TABLE if not exists users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, wins INTEGER, losses INTEGER);');
        });
        console.log('Init Done');
    };

    Users.close   = function(){Users.db.close()};

    Users.add     = function(username, password){ //return true if user added false indicates username is taken
        Users.db.serialize(function(){
            Users.db.run('INSERT INTO users (username, password, wins, losses) VALUES (?,?,?,?);', [username, password, 0, 0],function(err){
                if (err){
                console.log('in');
                }
            });
        });
    };


    Users.remove  = function(username){
        Users.db.serialize(function(){
            Users.db.run('DELETE * FROM users WHERE username = ?;', [username]);
        });
    };

    Users.verifyUser = function(username, password, ws){
        Users.db.serialize(function(){
            Users.db.get('SELECT * FROM users WHERE username = ?;', [username], function(err, row){
                var res = {redirect: true, url:  ''};
                if(row != null && row.password === password){
                    res.redirect = true;
                    res.url = 'http://chrisds.koding.io/main.html';
                    // msg.url = 'localhost:3000/main.html';
                }
                else{
                    res.redirect = false;
                }
                console.log(res);
                ws.send(JSON.stringify(res));
            });
        });
    };

    Users.showLeaderBoard = function(){
        Users.db.serialize(function(){
            Users.db.each('SELECT * FROM users ORDER BY wins DESC LIMIT 10;', function(err, row){ //get top 10 players
               /*
                * Show players on leaderboard
                */
            });
        });
    };
    return Users;
};
module.exports = Users;