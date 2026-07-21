const passport = require('passport');
const { BasicStrategy } = require('passport-http');

passport.use(
  new BasicStrategy((username, password, done) => {
    if (username === 'user1@email.com' && password === 'password1') {
      return done(null, { sub: username });
    }

    return done(null, false);
  })
);

module.exports = passport.authenticate('basic', {
  session: false,
});