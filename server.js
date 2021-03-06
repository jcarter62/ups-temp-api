#!/usr/bin/env node

/**
 * Module dependencies.
 */

let app = require('./app');
let debug = require('debug')('ups-temp:server');
let http = require('http');
require('dotenv').config();

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

let dbConfig = {
  "user": process.env.SQL_USER,
  "password": process.env.SQL_PASS ,
  "server":process.env.SQL_HOST,
  "database":process.env.SQL_DB,
  "options": {
    "instanceName":process.env.SQL_INSTANCE,
    "encrypt":false
  }
};
app.locals.dbConfig = dbConfig;

app.locals.sqlitedb = process.env.SQLITE_DB;

app.locals.debug = false;
if ( ( process.env.APP_DEBUG ).toLowerCase() == 'true' ) {
  app.locals.debug = true;
}

/**
 * Create HTTP server.
 */
let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
