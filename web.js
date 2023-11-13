require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const sqlsession = require('./helpers/sessionHelper')(session);

const errorHandlers = require('./helpers/errorHandlers');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('short'));

//body parser
//json
app.use(express.json());
//form
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'kRpg.8b\'^85u5+`',
  resave: false,
  saveUninitialized: false,
  store: sqlsession,
}));

app.use(async function(req, res, next) {
  
  if (req._parsedOriginalUrl.pathname == '/auth/login') {
    next();
    return;
  }

  res.locals.client_url = process.env.CLIENT_URL;

  next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);

var debug = require('debug')(process.env.PKG_NAME+':server');
var http = require('http');
var https = require('https');

var port = process.env.PORT || '8002';

app.set('port', port);

app.set('views', __dirname + '/views');

var server = http.createServer(app);
//var serverHttps = https.createServer(credentials, app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/*
serverHttps.listen(8543, () => {
    console.log('HTTPS Server running on port 8443');
});
*/

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
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

function onListening() {    
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);  
}

// catch 404 and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// error handler
/*
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/