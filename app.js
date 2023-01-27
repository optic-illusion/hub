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

/*
//express-openid-connect
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: false,
  baseURL: 'https://localhost:3000',
  clientID: 'dev-portal-staging-kelvintest1-ef3ca11c',
  issuerBaseURL: 'https://gateway-devportal2.pp.vids.dev/',
  secret: '192847ujfoaiwue0912u40uj13r09u0u123r',
  clientAuthMethod: 'private_key_jwt',
  clientAssertionSigningAlg: 'RS256',
  clientAssertionSigningKey: {
      p: '_yrSIpR7Bx-J_x8emkvxrcDfzrYdh5TWovzaC696CzBx2UjCLTEG2-KQTtXxfNpjQnzC2lKXgfJFMbjEAKfQ0A7YfXPIPzHCjzSvPhoZMYZxuY9zkSXonbQkLIFurcs_kkun4yIfBlT5ue-5DXWwkq_ztqLFN-Yo4TIcvUj09Us',
      kty: 'RSA',
      q: 'thqoLsdxcNej0CN7ONiuyMR5Wv640x02MHhzApF1ktMgEDBzuodk0mPm1mHfKjDiOsxaqDGML09TAAzEteXhPsYTK9fLIPOi-psuYBJZGRWbeZhHGRCNQieQqyJn6B0_1AiLP9By_ZCudFOJoPpIUVoMJ_jNMFF9S6HKbhlR2BM',
      d: 'qWZ4hIBF6WDtB1cIyERqRryFf586cu09XXrjGc6PF1qQac5g3yaQHtSejEEbVat1aM8UDrKwM36zzLOlnJgfrBWsLgdN3MLZYKa2fqNnCzd01vBL1PPx3IebsH4fssurVBgvWOnW_gErG2BApBoqlv1SNUGtE06fV3IMsCdspwrSPmr7IGdIxLKsRX1Mp-l2pQ2cIjZyVApxa68y0Ci-XTaBNRpqUiGeEYm0Zl7gLq1dd5qEM9h982wc76iIXXzrFQa35uz342rcPP4QYzauZNqzK-vqVqH4X694VNYo4C1hKzpOlIZaXj__NQ8dCwUjDltYKbZ7PmBaJ3dxmp7b8Q',
      e: 'AQAB',
      use: 'sig',
      kid: 'Kgo8Qnz-c8ocr_stHjByWgfHfFA8zEk-CaWCblfCS_w',
      qi: 'pcWWpS1IAuyfakOTEPlFZGGzNJtvlY_MnEE9qid9Y2W9lRgK3vTP1oIKmUipUzdsjGihMVmxJEavimdLBWyzg2e3uthkgrW1KZI_Y41ullZ_Vrd2900cug7bT9XWQh_n_yKIkvNF8bs5VrTQTi3k4XmM-EGF5xX3TLiVgjArn7s',
      dp: 'l9uJIbFSIqQfgWio0tUdqPWffKsfmd_3eRqYPdoZ_OzA5LqLbU-_MD9--JwU0uQ5rIkJgdsjdd-UVIoMhANbn2cmakrswsc_bfDB1mi706Car_9ynNB9xtU9rgr9rorGc6945BEbe644zPKhJCSFiFcU6P2n96OPcq5bMj9oIU8',
      alg: 'RS256',
      dq: 'gTzT5TcYVDxF_t5fgg2NpeCCO8kRBIrzvVyOSuFOrt_1Hmg0icmzDPlnhvg4uCmvNIl5QWrAkYbbYeqt5GX8AF_0lSX1_DHMlcxyEi6TWxERoS8oLiqoBa4sprepRHsVpHZX1Pcr1LbMiLQMtdlKX6nnfKq_fK4onPd6wb5obk8',
      n: 'tYMDYKd2Wu_e8-EPwE1brMmwulLHznnqYYF3o-04KQZG-GkvBIBOgivRuqdZnTfHsr0ArVcR47Oe4L2YPCCY-Kw1QTDRoBJxFtpgn320fQWkakyFn0O3RnkC3QAVomS-p81Ax2aTusot9W7l830j2WSSzbT5AYn7GnD1PoO-xGuOPApfEW61ZDMe73ehTr3SelEDvC5aEdmvif8dr92lo8KGF5IEO-2DzC6LQpO5CANkoP5JEWS9-s1APFLjWLI2BA50bmcFeUSn5YF-PEfGGH-dKLJFGjwk8S-Cl7GtSiVM82Vi7hqsrKkoaFHol0H-lu0HXKIulCVy9W1LCOB8kQ'
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid general_scope',
    audience: 'https://gateway-devportal2.pp.vids.dev/',
    redirect_uri: 'https://localhost:3000/profile'
  }
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
*/

app.use('/', indexRouter);

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