module.exports = function(){
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

    Users.verifyUser = function(username){
        var item = {password: 'not set'};
        var complete = false;
        Users.db.serialize(function(){
            Users.db.each('SELECT * FROM users WHERE username = ?;', [username], function(err, row){
                console.log("row",row.password);
                item.password = row.password;
                console.log("item",item.password);
            });
        });
        console.log(item.password);
        if (complete){
            console.log("done",item.password);
        }
    };

    Users.showLeaderBoard = function(){
        Users.db.serialize(function(){
            Users.db.each('SELECT * FROM users ORDER BY wins DESC LIMIT 10;', function(err, row){ //get top 10 players
               /*
                * Show players on leaderboard
                */
            })
        });
    };
    return Users;
};