Lookup
======

Lookup is a free, open, simple Markdown powered Knowledgebase for Nodejs. [Find out more &rarr;](http://github.io/wgalyen/lookup/what-is-lookup)

Requirements
------------

* [Node.js](http://nodejs.org) **v4.0.0** (or later)

Demo & Docs
-----------

See [http://github.io/wgalyen/lookup](http://github.io/wgalyen/lookup)

Install
-----------

It is recommended to create a new Git repository to store your documentation files and then install Lookup as a dependency into it.  
See the `example/` directory for how this implementation works.
6. Visit `http://localhost:3000` in your web browser

1. Switch to your existing or new project directory
2. Add Lookup to your project via NPM's package.json file or downloading the latest version from the [releases page](https://github.com/wgalyen/Lookup/releases)
3. In a terminal, run `npm install` to install the node dependencies
4. To start Lookup, run `npm start` (or `npm run start_win` on Windows)
5. Visit `http://localhost:3000` in your web browser

Running as a Service
--------------------

You can run Lookup easily in the background on your local or production machines with PM2.

1. Install Lookup globally with `npm install -g lookup`
2. Edit the configuration file in your global NPM `node_modules/` directory (locate with `which lookup` on *NIX)
3. Run Lookup with `lookup start` and access logs with `lookup logs`
4. When finished, run `lookup stop`

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
