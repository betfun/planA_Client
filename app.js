const express = require('express');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const sqlsession = require('./helpers/sessionHelper')(session);
const helmet = require('helmet');

const cors = require('cors');

const errorHandlers = require('./helpers/errorHandlers');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

const commonHelper = require('./helpers/commonHelpers');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const whitelist = [];

if (process.env.NODE_ENV == 'development') whitelist.push(`http://127.0.0.1:${process.env.PORT}`);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  //origin: true,
  credentials: true
}

app.use(function (req, res, next) {
  cors(corsOptions)(req, res, next);
});

let helmetprop = {
  //contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
  referrerPolicy: false,
  contentSecurityPolicy : {
    directives: {      
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),      
      /* 
      none : 어떳 것도 허용하지 않음
      self : 현재 출처에서는 허용하지만 하위 도메인에서는 허용되지 않음
      unsafe-inline : 인라인 자바스크립트, 인라인 스타일을 허용
      unsafe-eval	: eval과 같은 텍스트 자바스크립트 메커니즘을 허용 
      */
      // 구글 API 도메인과 인라인 스크립트, eval 스크립트를 허용
      "script-src-attr": ["'unsafe-inline'"],
      "script-src": ["'self'", "*.googleapis.com", "*.fontawesome.com",  "'unsafe-inline'", "'unsafe-eval'"],      
      "connect-src": ["'self'", "*.fontawesome.com", "'unsafe-inline'",],      
      "img-src": ["'self'", 'data:', '*.s3.us-west-1.amazonaws.com'],      
      // 소스에 https와 http 허용
      "base-uri" : ["http:", "https:"],
    }
  }
}

if (app.get('env') === 'development') {
  helmetprop['contentSecurityPolicy'] = false;
}

app.use(helmet(helmetprop));


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
app.use('/user', commonHelper.isAuthorized, userRouter);

app.use(errorHandlers.notFound);

if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;