var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const fs = require('fs');
const njwk = require('node-jwk');
const {Strategy, Issuer, generators} = require('openid-client');

var indexRouter = require('./routes/index');

var app = express();
app.use(session({
  secret: 'pizza cats',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const config = {//oidc configuration information
  clientId: 'dev-portal-staging-kelvintest1-ef3ca11c',
  issuer: 'https://gateway-devportal2.pp.vids.dev/',
  configInfo: 'https://gateway-devportal2.pp.vids.dev/.well-known/openid-configuration',
  redirect_uri: 'https://localhost:3000/profile',
  request_object_signing_alg: 'RS256',
  scope: 'openid general_scope',
  token_endpoint_auth_method: 'private_key_jwt',
  token_endpoint_auth_signing_alg: 'RS256'
};

(async () => {
  const issuer = await Issuer.discover(config.configInfo);
  const client = new issuer.Client({
    client_id: config.clientId,
    request_object_signing_alg: config.request_object_signing_alg,
    token_endpoint_auth_method: config.token_endpoint_auth_method,
    token_endpoint_auth_signing_alg: config.token_endpoint_auth_signing_alg
  }, JSON.parse(fs.readFileSync('keys.json', 'utf8'))
  );
  const state = generators.random();
  const req_obj = await client.requestObject({
    redirect_uri: config.redirect_uri,
    scope: config.scope,
    response_type: 'code',
    state 
  })
  const params = {
    redirect_uri: config.redirect_uri,
    grant_type: 'authorization_code',
    scope: config.scope,
    response_type: 'code',
    state,
    request: req_obj
  };
  passport.use('oidc', new Strategy({ client, params }, (tokenset, userinfo, done) => {
    return done(null, userinfo); //return user info
  }));
})()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
   done(null, {client_id: id });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;