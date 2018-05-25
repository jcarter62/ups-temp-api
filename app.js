let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let homeRoute = require('./homeroute');
let apiRoute = require('./api');

let app = express();

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', homeRoute);
app.use('/api', apiRoute );

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
