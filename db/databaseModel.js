var password = require('password-hash-and-salt');
var crypto = require('crypto');


var Users = function(){
    Users.clients = {};
    
    Users.sqlite3 = require('sqlite3').verbose();
    Users.db      = new Users.sqlite3.Database('users.db'); //open or create database

    Users.init    = function(ws){
        Users.db.serialize(function(){
            Users.db.run('CREATE TABLE if not exists users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, hash TEXT, wins INTEGER, losses INTEGER, plays INTEGER);');
        });
        console.log('Init Done');
    };

    Users.close   = function(){Users.db.close()};

    Users.add     = function(username, hash, ws){ //return true if user added false indicates username is taken
        Users.db.serialize(function(){
            Users.db.run('INSERT INTO users (username, hash, wins, losses, plays) VALUES (?,?,?,?,?);', [username, hash, 0, 0, 0],function(err){
                var res = {redirect: false};
                if (!err){

                    res = {
                        redirect: true, 
                        // url: "http://chrisds.koding.io"
                        url: "http://localhost:3000"
                    };
                }
                ws.send(JSON.stringify(res));
            });
        });
    };

    Users.updateWinsandLosses = function(won, lost){
        Users.db.serialize(function(won,lost){
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

    Users.verifyUser = function(username, hash, ws){
        Users.db.serialize(function(){
            Users.db.get('SELECT * FROM users WHERE username = ?;', [username], function(err, row){
                var res = {redirect: false, url:  ''};
                if(row != null){
                    var user = {
                        username:   username,
                        hash:   row.hash,
                        wins:   row.wins,
                        losses: row.losses,
                        plays:  row.plays
                    };
                    verifyPass(user, hash, ws, res);
                }
                else{
                    console.log("\nNOT IN TABLE",res);
                    ws.send(JSON.stringify(res));
                }
            });
        });
    };
    
    Users.updatePlayer = function (user, winner){
        Users.db.serialize(function(user, winner){
            if (!winner){
                Users.db.run('UPDATE users Set losses = ?, plays = ?, WHERE username = ?;', [user.losses, user.plays, user.username]);
            }
            else{
                Users.db.run('UPDATE users Set wins = ?, plays = ?, WHERE username = ?;', [user.wins, user.plays, user.username]);
            }
        });
    };

    Users.showLeaderBoard = function(ws){
        Users.db.serialize(function(){
            var msg = {};
            msg.updateLeaderBoard = "post leaderboard";
            // var send = true;
            Users.db.each('SELECT * FROM users ORDER BY wins DESC LIMIT 10;', function(err, row){ //get top 10 players
                if (row != null){
                    msg[row.id] = row.username;
                    //test
                    ws.send(JSON.stringify(msg));
                    // console.log("Leaderboard update sent.", msg);
                }
            });
        });
    };

    Users.clockwork = require('clockwork')({key: 'f31b053fa6dc41a62becc86c82c3a91c728fe079'});

    Users.sendTextMessage = function(number, username, ws){
        Users.db.serialize(function(){
            var msg = {};
            msg.cmd = 'text message result';
            var rank = 0;
            Users.db.each('Select * FROM users ORDER BY wins DESC', function(err, row){
                rank++;
                if (row != null){
                    if (row.username === username){
                        // console.log('Rank ', rank);
                        Users.clockwork.sendSms({To: number, Content: row.username + ' is playing Tic-Tac-Toe at [url here]! They challenge you to beat their rank (' + rank + ') in the leaderboards.'},
                        function(err, res){
                            if (err){
                                msg.successful = false;
                                console.log(err);
                            }
                            else{
                                msg.successful = true;
                                // console.log('Good');
                                // console.log(res);
                                if (res.SMS_Resp.ErrNo){
                                    console.log('Error occured sending message');
                                    msg.successful = false;
                                }
                            }
                            ws.send(JSON.stringify(msg));
                        }); 
                    }
                }
                else{
                    // console.log('not found');
                    msg.successful = false;
                    ws.send(JSON.stringify(msg));
                }
            });

        });
    };
    return Users;
};

function verifyPass (user, hash, ws, res){
    // Verifying a hash 
    password(hash).verifyAgainst(user.hash, function(error, verified) {
        if (error)
            console.log("error");
        if(verified) {
            var id = crypto.randomBytes(20).toString('hex');
            console.log("\nNew id", id);
            delete user.hash;
            user.ws    = ws;
            user.expire = Date.now() + 1000*60*60; // 1 hour session
            Users.clients[id] = user;
            res.id = id;
            res.redirect = true;
            // res.url = 'http://chrisds.koding.io/main.html';
            //  res.url = 'http://localhost:3000/main.html';

        }
        ws.send(JSON.stringify(res));
    });
}

module.exports = Users;