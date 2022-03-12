'use strict';
const mysql = require('mysql');

var pool = mysql.createPool({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'Fer94_valde',
	database: 'nodeShopify',
	connectionLimit   : 10,
	supportBigNumbers : true // should be true when dealing with big numbers (BIGINT and DECIMAL columns)
});

module.exports = pool;