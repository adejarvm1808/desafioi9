const mysql = require('mysql2');

const pool = mysql.createPool({

    "user": "b5d2134cd8e2d2",
    "password" : "5bfdec39",
    "database": "heroku_b0f466ca53b6b88",
    "host": "us-cdbr-east-04.cleardb.com",
    "port": "3306"
    
});

exports.pool = pool;