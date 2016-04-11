var password = require('password-hash-and-salt');

var Users = function(){
    Users.sqlite3 = require('sqlite3').verbose();
    Users.db      = new Users.sqlite3.Database('users.db'); //open or create database

    Users.init    = function(ws){
        Users.db.serialize(function(){
            Users.db.run('CREATE TABLE if not exists users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, hash TEXT, wins INTEGER, losses INTEGER);');
        });
        console.log('Init Done');
    };

    Users.close   = function(){Users.db.close()};

    Users.add     = function(username, hash, ws){ //return true if user added false indicates username is taken
        Users.db.serialize(function(){
            Users.db.run('INSERT INTO users (username, hash, wins, losses) VALUES (?,?,?,?);', [username, hash, 0, 0],function(err){
                console.log("\nHASH:",hash);
                var res = {redirect: false};
                if (!err){
                    //res = {redirect: true, url: "http://chrisds.koding.io"};
                    res = {redirect: true, url: "http://localhost:3000"};
                }
                ws.send(JSON.stringify(res));
            });
        });
    };

    Users.updateWinsandLosses = function(username, won, lost){
        Users.db.serialize(function(username,won,lost){
            Users.db.get('SELECT wins FROM users WHERE username = ?;', [won], function(err, wins){
                if(wins != null){
                    Users.db.run("UPDATE users SET wins = ? WHERE username = ?;",[++wins,won]);
                }
                else{
                    console.log("\nNOT IN TABLE",res);
                }
            });
            Users.db.get('SELECT losses FROM users WHERE username = ?;', [lost], function(err, losses){
                if(losses != null){
                    Users.db.run("UPDATE users SET losses = ? WHERE username = ?;",[++losses,lost]);
                }
                else{
                    console.log("\nNOT IN TABLE",res);
                }
            });
        }); 
        console.log('Update Done');
    };

    Users.remove  = function(username){
        Users.db.serialize(function(){
            Users.db.run('DELETE * FROM users WHERE username = ?;', [username]);
        });
    };

    Users.verifyUser = function(username, password, ws){
        Users.db.serialize(function(){
            Users.db.get('SELECT * FROM users WHERE username = ?;', [username], function(err, row){
                var res = {redirect: false, url:  ''};
                if(row != null){
                    verifyPass(password, row.hash, ws, res);
                }
                else{
                    console.log("\nNOT IN TABLE",res);
                    ws.send(JSON.stringify(res));
                }
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

function verifyPass (pass, hash, ws, res){
    console.log("pass is:",pass);
    // Verifying a hash 
	password(pass).verifyAgainst(hash, function(error, verified) {
        console.log("\nverified hash", hash);
        if (error)
            console.log("error");
		if(verified) {
			res.redirect = true;
            //res.url = 'http://chrisds.koding.io/main.html';
            res.url = 'http://localhost:3000/main.html';
		}
		console.log("\nFROM VERIFY PASS",res);
		ws.send(JSON.stringify(res));
	});
}

module.exports = Users;