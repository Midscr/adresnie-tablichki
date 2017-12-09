const mysql = require('mysql');
const db = require('../config');

const connection = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

connection.connect(function (err){
  if (err) {
    console.error('error connecting: ' + err.stack);
    return
  } else {
    console.log('connected as id ' + connection.threadId);
  }
});

module.exports = connection;