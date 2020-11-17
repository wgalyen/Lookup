Lookup
======

Lookup is a free, open, simple Markdown powered Knowledgebase for Nodejs. [Find out more &rarr;](http://github.io/wgalyen/lookup/what-is-lookup)

Requirements
------------

* [Node.js](http://nodejs.org) **v4.0.0** (or later)

Install
-------

1. Download the latest version of Lookup from the [releases page](https://github.com/wgalyen/Lookup/releases)
2. Create a new directory where you would like to run the app, and un-zip the package to that location
3. Fire up a Terminal, the Node Command Prompt or shell and change directory to the root of the Lookup application (where app.js and config.js are)
4. Run `npm install` to install the node dependencies
5. To start Lookup, run `npm start` (or `npm run start_win` on Windows)
6. Visit `http://localhost:3000` in your web browser

Accessing Lookup
----------------

Visit `http://localhost:3000` in your web browser.

Demo & Docs
-----------

See http://github.io/wgalyen/lookup

Production Notes
----------------

When running a live site you'll want to set the `PORT` env variable to `80` so you don't need to add `:3000` to the URL.
This requires root privileges and is not recommended.

Instead, it is preferred to use a reverse proxy for security reasons.
Heroku and other services handle this aspect for you, but you can implement your own reverse proxy with Nginx or Apache.
If you want an example with Nginx, please submit an issue.

You can change the port anytime by setting the environment variable in your propfile, or running in-line as below:
`$ PORT=1234 npm start`

Credits
-------

Lookup was created by [Warren Galyen](http://mechanikadesign.com).
Released under the [MIT license](https://raw.githubusercontent.com/wgalyen/Lookup/master/LICENSE).
