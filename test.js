let express = require('express');
let sql = require('mssql');
let router = express.Router();

router.post('/', function( req, res ) {
  let config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    server: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    options: {
      instanceName: process.env.SQL_INSTANCE,
      encrypt: true
    }
  };

  let result = {'api': '//' + req.headers.host + req.baseUrl };

  sql.connect(config, function(err) {
    if ( err ) {
      console.dir(err);
      result.error = err;
      res.send(result);
    }

    // Otherwise, we are connected !!

    console.log('Connected');

    result.status = 'connected';

    res.send(result);
  } );

  // .then( pool => {
  //   console.log('in sql.connect');
  //   return pool.request()
  //     .input('username', sql.varchar(50), 'jc' )
  //     .input('userpass', sql.varchar(50), 'wmis02')
  //     .output('result', sql.varchar(30) )
  //     .output('name', sql.varchar(100) )
  //     .output('email', sql.varchar(100) )
  //     .execute('sp_mi_authorize')
  //
  // }).then( qresult => {
  //   console.dir(qresult);
  //   let jsonResult = JSON.stringify(qresult);
  //   result.output = jsonResult;
  //   res.send(result);
  // })
  //   .catch(err => {
  //   })
  // ;
  //
  // sql.on('error', err => {
  //   console.dir(err);
  //   result.error = err;
  //   res.send(result);
  // });


});


module.exports = router;
