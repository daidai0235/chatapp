const mysql = require('mysql');
const pool = mysql.createPool({
  user: 'daidai',
  password: '123456',
  database: 'dating',
  host: 'localhost'
});


let query = function( sql, values ) {
  return new Promise(function( resolve, reject ) {
    pool.getConnection(function(err, connection) {
      if (err) {
        resolve(err)
      } else {
        connection.query(sql, values, function(err, rows) {
          if (err) {
            reject(err)
          }else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
};


module.exports = {
  query: query
};
