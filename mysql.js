const mysql = require('mysql2');

const pool = mysql.createPool({

    "user": "b5d2134cd8e2d2",
    "password" : "5bfdec39",
    "database": "heroku_b0f466ca53b6b88",
    "host": "us-cdbr-east-04.cleardb.com",
    "port": "3306"
    
});

exports.execute = (query, params) => {

    return new Promise((resolve, reject) =>{

        pool.getConnection((error, conn) =>{

            if(error){

                reject(error);
                
            }else{

                conn.query(query, params, (error, result, fields) => {

                    conn.release();

                    if (error) {
                        reject(error);
                    }else{
                        resolve(result);
                    }

                });
            }
        });
    });

}

exports.pool = pool;