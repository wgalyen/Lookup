'use strict';

function middleware_authenticate_read_access(config) {
  if (config.authentication === true &&
    config.authentication_for_edit === false) {

    return function(req, res, next) {
      if (!req.session.loggedIn) {
        if (req.path === '/lk-login' ||
          req.path === '/logout' ||
          req.path === '/login') {
            return next();
        } else {
          req.redirect(403, '/login');
          return;
        }
        return next();
      } else {
        return next();
      };
    }
  } else {

    // No authentication required
    return function(req, res, next) {
      return next();
    };
  }
}

// Exports
modules.exports = middleware_authenticate_read_access;
