let express = require('express');
let router = express.Router();

router.get('/', function( req, res ) {
  let result = {'api': '//' + req.headers.host + req.baseUrl + '/api'};

  res.send(result);
});

module.exports = router;
