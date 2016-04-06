//sequelize models
var Sequelize = require('sequelize');
var db = new Sequelize('sqlite://' + __dirname + "/users.db");

module.exports = function(sequelize, DataTypes){
   return db.define('users', { //create table model
	token: {
		type:      Sequelize.INTEGER,
		//allowNull: false,
		get:       function() {
			var id = this.getDataValue('id');
			return id;
		},
		set:       function(val) {
			this.setDataValue('id', val);
		}
	},
	username: {
		type:      Sequelize.TEXT,
		allowNull: false,
		get:       function() {
			var username = this.getDataValue('username');
			return username;
		},
		set:       function(val) {
			this.setDataValue('username', val);
		}
	},
	password: {
		type:      Sequelize.TEXT,
		allowNull: false,
		get:       function() {
			var password = this.getDataValue('password');
			return password;
		},
		set:       function(val) {
			this.setDataValue('password', val);
		}
	},
	wins:     {
		type:      Sequelize.INTEGER,
		//allowNull: false,
		get:       function() {
			var wins = this.getDataValue('wins');
			return wins;
		},
		set:       function(val) {
			this.setDataValue('wins', val);
		}
	},
	losses:   {
		type:      Sequelize.INTEGER,
		//allowNull: false,
		get:       function() {
			var losses = this.getDataValue('losses');
			return losses;
		},
		set:       function(val) {
			this.setDataValue('losses', val);
		}
	}
});
}