let express = require('express');
let sql = require('mssql');
let router = express.Router();
let uuidv1 = require('uuid/v1');
let sqlite = require('sqlite3').verbose();
let tokens = require('tokens');
const msIn30Days = 2592000000;
let debugging = false;

router.post('/', function( req, res ) {
  let dbConfig = req.app.locals.dbConfig;
  let result = {'api': '//' + req.headers.host + req.baseUrl };
  let sqlitedb = req.app.locals.sqlitedb;
  if ( req.app.locals.debug  ) {
    debugging = true;
  }

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
        .then(async (sqlResult, returnVal, affected) => {
          let data = sqlResult.output;
          if (data.AuthResult == 'authorized') {
            result.status = 'success';
            result.data = data;

            let tok = new tokens(app.locals);
            result.data.db = tok.createToken()


            result.data.db = await createToken(result, sqlitedb);
          } else {
            result.status = 'failed';
          }
          result.data = data;
        })
        .then( () => {
          myFinal(result, res, sql );
    })
    .catch((reason) => {
          dbg( 'catch error:' + JSON.stringify(reason) );
          result.data = reason;
          myFinal(result, res, sql);
        });
    } else {
      dbg( JSON.stringify(err));
      result.error = err;
      res.send(result);
      sql.close();
    }
  } );

  // async function createToken(data, sqlitedb) {
  //   let userToken = await shortUUID();
  //   let keyText = await shortUUID();
  //
  //   let name = data.data.name;
  //   let email = data.data.email;
  //   let expire = new Date;
  //
  //   expire.setDate(expire.getDate() + 30);
  //   let expireText = expire.toISOString();
  //
  //   let returnVal = {
  //     token: userToken,
  //     name: name,
  //     email: email,
  //     expire: expireText,
  //     key: keyText
  //   };
  //
  //   //
  //   let db = new sqlite.Database(sqlitedb);
  //
  //   db.serialize(() => {
  //     let dbcreate = 'create table if not exists tokens ( ' +
  //       'token text, ' +
  //       'key text, ' +
  //       'name text, ' +
  //       'email text, ' +
  //       'expire numeric ) ';
  //     let dbinsert = 'insert into tokens values ( ?, ?, ?, ?, ? ) ';
  //
  //     //      db.run(dbcreate);
  //     let stmtCreate = db.prepare(dbcreate);
  //     stmtCreate.run();
  //     stmtCreate.finalize();
  //
  //     //
  //     let stmt = db.prepare(dbinsert);
  //     stmt.run(userToken, keyText, name, email, expireText);
  //     stmt.finalize();
  //   });
  //
  //   dbg('CreateToken Return: ' + JSON.stringify(returnVal));
  //   db.close();
  //   return returnVal;
  // }

  function myFinal(data, res, sql) {
    sql.close();
    res.send(data);
  }

  // function shortUUID() {
  //   let clockseq = Math.floor( (Math.random() * 16383) + 1 );
  //   let r1 = new Date;
  //   let r2 = Math.floor( (Math.random() * 9999));
  //
  //   const options = {
  //       node: [0x2F, 0x73, 0x45, 0x67, 0x89, 0xAB],
  //       clockseq: clockseq,
  //       msecs: r1,
  //       nsecs: r2
  //   };
  //
  //   for ( let i = 0; i < 6; i++ ) {
  //     let x = Math.floor((  Math.random() * 250 ) + 2 );
  //     options.node[i] = x;
  //   }
  //
  //   let uid =  uuidv1(options);
  //   let result = uid.replace(/-/g,'');
  //   dbg( 'shortUUID(): ' + result + ' / ' + JSON.stringify(options));
  //   return result;
  // }

  function dbg(msg) {
    if (debugging ) {
      console.log(msg);
    }
  }

});



module.exports = router;
