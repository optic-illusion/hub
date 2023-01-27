var express = require('express');
var router = express.Router();
const passport = require('passport');
//const { requiresAuth } = require('express-openid-connect');

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

/* express-openid-connect
// req.isAuthenticated is provided from the auth router
router.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
});

// the redirect_uri after auth
router.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});
*/
router.get('/profile', passport.authenticate('oidc'), (req, res) => {
  res.send(req.user)
});

module.exports = router;
