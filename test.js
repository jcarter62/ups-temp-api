let express = require('express');
let sql = require('mssql');
let router = express.Router();

router.post('/', function( req, res ) {
  let dbConfig = req.app.locals.dbConfig;
  let result = {'api': '//' + req.headers.host + req.baseUrl };

  sql.connect(dbConfig, function(err) {
    if ( err ) {
      console.dir(err);
      result.error = err;
      res.send(result);
      sql.close();
    } else {
        console.log('Connected');
        result.status = 'connected';

        let sp_result = '';
        let sp_name = '';
        let sp_email = '';
        // Attempt to authorize
        let request = new sql.Request();
        request.stream = false;
        request.input('username', sql.VarChar, '');
        request.input('userpass', sql.VarChar, '');
        request.output('AuthResult', sql.VarChar, sp_result);
        request.output('name', sql.VarChar, sp_name);
        request.output('email', sql.VarChar, sp_email);
        request.execute('sp_mi_authorize', function(err, sqlResultl, returnVal, affected) {
          if ( err ) {
            console.log('login error');
            result.results = sqlResultl;
            res.send(result);
            sql.close();
          } else {
            result.results = sqlResultl.output;
            res.send(result);
            sql.close();
          }
        });


/*
declare @username varchar(50) = 'jc';
declare @userpass varchar(50) = 'wmis02';
declare @result     varchar(30);
declare @name           varchar(100);
declare @email          varchar(100);
declare @sep varchar(10) = ' / ';

execute sp_mi_authorize @username, @userpass, @result out, @name out, @email out;

select @result + @sep + @name + @sep + @email;


 */


    }
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
