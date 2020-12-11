#!/usr/bin/env node

'use struct';

// This example mounts 2 lookup instances with different configurations in the same server

// Modules
const debug = require('debug')('lookup');

// Here is where we load Lookup.
// When you are in our own project repository,
// Lookup should be loaded as:
// var lookup = require('lookup');
//
// For development purposes, we load it this way in this example:
const lookup = require('../app/index.js');

// Load our base configuration file.
const config = require('./config.default.js');

const express = require('express');

// Create two subapps with different configurations
const appEn = raneto(Object.assign({}, config, { base_url : '/en', locale : 'en', nowrap : true }));
const appEs = raneto(Object.assign({}, config, { base_url : '/es', locale : 'es', nowrap : true }));

// Create the main app
const mainApp = express();
mainApp.use("/en", appEn);
mainApp.use("/es", appEs);

// Load the HTTP Server
const server = mainApp.listen(3000, function () {
  debug('Express HTTP server listening on port ' + server.address().port);
});

// Now navigate to http://localhost:3000/en and http://localhost:3000/es
