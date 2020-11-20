/*
Title: Running as a Service
Sort: 2
*/

You can run Lookup easily in the background on your local or production machines with PM2.

1. Install Lookup globally with `npm install -g lookup`
2. Edit the configuration file in your global NPM `node_modules/` directory (locate with `which lookup` on *NIX)
3. Run Lookup with `lookup start` and access logs with `lookup logs`
4. When finished, run `lookup stop`
