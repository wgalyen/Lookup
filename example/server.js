#!/usr/bin/env node

'use strict';

// Modules
var debug = require('debug')('lookup');

// Here is where we load Lookup.
// When you are in your own project repository,
// Lookup would be installed via NPM and loaded as:
// var lookup = require('lookup');
var lookup = require('../app/index.js');

// Then, we load our configuration file
// This can be done inline, with a JSON file,
// or with a Node.js module as we do below.
var config = require('./config.default.js');

// Finally, we initialize Lookup
// with our configuration object
var app = lookup(config);

// Load the HTTP Server
var server = app.listen(app.get('port'), function () {
    debug('Express HTTP server listening on port ' + server.address().port);
});
