if (process.env.HTPASSWD_FILE) {
  module.exports = require('./basic-auth');
} else {
  module.exports = require('./cognito');
}