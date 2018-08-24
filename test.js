let express = require('express');
let sql = require('mssql');
let router = express.Router();
let uuidv1 = require('uuid/v1');
let sqlite = require('sqlite3').verbose();

router.post('/', function( req, res ) {
  let dbConfig = req.app.locals.dbConfig;
  let result = {'api': '//' + req.headers.host + req.baseUrl };
  let sqlitedb = req.app.locals.sqlitedb;

  let req_username = '';
  let req_userpass = '';

  if ( req.body ) {
    req_username = req.body.username;
    req_userpass = req.body.userpass;
  }

  sql.connect(dbConfig, function(err) {
    if (!err) {
      result.status = 'connected';

      let sp_result = '';
      let sp_name = '';
      let sp_email = '';
      // Attempt to authorize

      let req = new sql.Request();
      req.stream = false;
      req
        .input('username', sql.VarChar, req_username)
        .input('userpass', sql.VarChar, req_userpass)
        .output('AuthResult', sql.VarChar, sp_result)
        .output('name', sql.VarChar, sp_name)
        .output('email', sql.VarChar, sp_email)
        .execute('sp_mi_authorize')
        .then((sqlResultl, returnVal, affected) => {
            let data = sqlResultl.output;
            if ( data.AuthResult == 'authorized' ) {
              result.status = 'success';
              result.data = data;
              createToken(result, sqlitedb );
            } else {
              result.status = 'failed';
            }
            result.data = data;
            myFinal(result, res, sql);
        })
        .catch((reason) => {
          result.data = reason;
          myFinal(result, res, sql);
        });
    } else {
      console.dir(err);
      result.error = err;
      res.send(result);
      sql.close();
    }
  } );

  function createToken( data, sqlitedb ) {
    let uid = uuidv1()  ;
    data.key = uid;

    //
    let db = new sqlite.Database( sqlitedb );

    db.serialize( () => {
      let dbcreate = 'create table if not exists tokens ' +
        '( token text, name text, email text ) ';
      let dbinsert = 'insert into tokens values ( ?, ?, ? ) ';

      //      db.run(dbcreate);
      let stmtCreate = db.prepare(dbcreate);
      stmtCreate.run();
      stmtCreate.finalize();

      //
      let stmt = db.prepare(dbinsert);
      stmt.run( data.key, data.data.name, data.data.email );
      stmt.finalize();
    });

    db.close();
  }

  function myFinal(data, res, sql) {
    sql.close();
    res.send(data);
  }

});



module.exports = router;
