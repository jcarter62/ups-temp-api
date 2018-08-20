let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let path = require('path');
let fs = require('fs');

// Replace remote-addr with correct remote address.
// This expects this server to be behind an ngnix server,
// and the following has been added to the server.location.
//
// proxy_set_header X-Real-IP $remote_addr;
//
logger.token('remote-addr', function( req, res) {
    let client = req.headers['x-real-ip'];
    if ( client <= '' ) {
      client = req.ip;
    }
    return client;
});

let homeRoute = require('./homeroute');
let apiRoute = require('./api');
let authRoute = require('./auth');
let testRoute = require('./test');

let app = express();

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const dbJSON = __dirname + path.sep + 'db.json';
let dat = fs.readFileSync( dbJSON, 'utf8');
const dbConfig = JSON.parse(dat).config;
app.locals.dbConfig = dbConfig;
dat = null;



app.use('/', homeRoute);
app.use('/api', apiRoute );
app.use('/auth', authRoute);
app.use('/test', testRoute);

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(500);
  res.send({'status': 'error'});
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({'status':'error'});
});

module.exports = app;
