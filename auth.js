let express = require('express');
let router = express.Router();
require('./db');

// Expect username, password
// Output a
router.post('/login', function( req, res ) {


  //  let result = {'api': '//' + req.headers.host + req.baseUrl };
//  db.dump_users( { res } );


  db = new DB(res, 'jim', 'pass');
//  res.send(result);
});

router.post('/logout', function( req, res ) {
  let result = {'api': '//' + req.headers.host + req.baseUrl };
  res.send(result);
});

module.exports = router;



