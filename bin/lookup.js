#!/usr/bin/env node

//Hide Keymetrics banner on first time PM2 is required
var consoleLog = console.log;
console.log = function() {};
var pm2 = require('pm2');
console.log = consoleLog

var program = require('commander');
var path = require('path');
var pkg = require('../package.json');
var Tail = require('always-tail');

process.chdir(__dirname + "/..");

program
    .version(pkg.version);

program
    .command('start')
    .description('Start Lookup Service')
    .action(function(){
        pm2.connect(function() {
            pm2.start({
                    script    : path.normalize(__dirname + "/../example/server.js"),
                    exec_mode : 'fork',
                    instances : 1,
                    name: "lookup"
                },
                function(err, apps) {
                    if(!err){
                        console.log("Lookup Service Started.")
                    } else {
                        console.log("Lookup Failed to Start: " + err.msg)
                    }
                    pm2.disconnect();
                });

        });
    });

program
    .command('stop')
    .description('Stop Lookup Service')
    .action(function(){
        pm2.connect(function() {
            pm2.stop("lookup", function(err, proc){
                if(err){
                    console.log("Lookup could not be stopped: " + err.msg);
                    process.exit(1);
                }
                pm2.delete("lookup", function(err, proc){
                    if(!err){
                        console.log("Lookup Stopped")
                        process.exit(0);
                    } else {
                        console.log("Lookup could not be stopped: " + err.msg);
                        process.exit(1);
                    }
                })
            });
        });
    });



program
    .command('restart')
    .description('Restart Lookup Service')
    .action(function(){
        pm2.connect(function() {
            pm2.restart("lookup", function(err, proc){
                if(err){
                    console.log("Lookup could not be restarted: " + err.msg);
                    process.exit(1);
                } else {
                    console.log("Lookup restarted");
                    process.exit(0);
                }
            });
        });
    });

program
    .command('logs')
    .description('Show Lookup Logs')
    .action(function(){
        pm2.connect(function() {
            pm2.describe("lookup", function(err, list){
                if(err){
                    console.log("Error getting info: " + err.msg);
                    process.exit(1);
                } else if(list.length == 0){
                    console.log("Lookup not running");
                    process.exit(0);
                } else {
                    var log = new Tail(list[0]['pm2_env']['pm_out_log_path'], '\n', {interval: 500});
                    var error_log = new Tail(list[0]['pm2_env']['pm_err_log_path'], '\n', {interval: 500});

                    log.on('line', function(data) {
                        console.log(data);
                    });
                    error_log.on('line', function(data) {
                        console.log(data);
                    });
                }
            });
        });
    });

//show the config file location in the help
function customHelp(text){
    var textArray = text.split(/\r?\n/);
    textArray[3] = "  Config: " + path.normalize(__dirname + "/../example/config.default.js\n");
    return textArray.join('\n');
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp(customHelp);
    return;
}
