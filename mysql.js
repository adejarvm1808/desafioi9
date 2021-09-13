const mysql = require('mysql2');

const pool = mysql.createPool({
    "user": "adejar",
    "password" : "15253545",
    "database": "desafio_i9",
    "host": "localhost",
    "port": "3306"
});

exports.pool = pool;