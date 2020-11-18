
'use strict';

// Modules
var express       = require('express');
var path          = require('path');
var fs            = require('fs');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookie_parser = require('cookie-parser');
var body_parser   = require('body-parser');
var _s            = require('underscore.string');
var moment        = require('moment');
var marked        = require('marked');
var validator     = require('validator');
var extend        = require('extend');
var hogan         = require('hogan-express');
var session       = require('express-session');
var sanitize      = require('sanitize-filename');
var lookup        = require('lookup-core');

function remove_image_content_directory (config, pageList) {
    var i;
    for (i = 0; i < pageList.length; i++) {
        if (pageList[i].slug === config.image_url.replace(/\//g, '')) {
            pageList.splice(i, 1);
        }
    }
    return pageList;
}

function initialize (config) {

    // Load Files
    var error_handler = require('./middleware/error_handler.js') (config);
    var route_login   = require('./routes/login.route.js')       (config);

    // New Express App
    var app = express();

    // empty authorization middleware in case we don't need authentication at all
    var isAuthenticated = function(req, res, next) {
        return next();
    };

    // Setup Port
    app.set('port', process.env.PORT || 3000);

    // Setup Views
    if (!config.theme_dir)  { config.theme_dir  = path.join(__dirname, '..', 'themes'); }
    if (!config.theme_name) { config.theme_name = 'default'; }
    app.set('views', path.join(config.theme_dir, config.theme_name, 'templates'));
    app.set('layout', 'layout');
    app.set('view engine', 'html');
    app.enable('view cache');
    app.engine('html', hogan);

    // Setup Express
    app.use(favicon(config.public_dir + '/favicon.ico'));
    app.use(logger('dev'));
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended : false }));
    app.use(cookie_parser());
    app.use(express.static(config.public_dir));
    app.use(config.image_url, express.static(path.normalize(config.content_dir + config.image_url)));

    // Setup config
    extend(lookup.config, config);

    // HTTP Authentication
    if (config.authentication === true) {
        app.use(session(
            {
                secret: "changeme",
                name: "lookup.sid",
                resave: false,
                saveUninitialized: false
            }
        ));

        app.post('/lk-login', route_login);

        app.get("/login", function(req, res, next){
            return res.render('login', {
                layout : null
            });
        });
        app.get("/logout", function(req, res, next){
            req.session.loggedIn = false;
            res.redirect("/login");
        });

        // Authentication Middleware
        isAuthenticated = function(req, res, next) {
            if (! req.session.loggedIn) {
                res.redirect(403, "/login");

                return;
            }

            return next();
        }
    }

    // Online Editor Routes
    if (config.allow_editing === true) {

        app.post('/lk-edit', isAuthenticated, function (req, res, next) {
            var req_file     = req.body.file.split('/');
            var fileCategory = '';
            var fileName     = '/' + sanitize(req_file[1]);
            if (req_file.length > 2) {
                fileCategory   = '/' + sanitize(req_file[1]);
                fileName       = '/' + sanitize(req_file[2]);
            }
            var filePath     = path.normalize(lookup.config.content_dir + fileCategory + fileName);
            if (!fs.existsSync(filePath)) { filePath += '.md'; }
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status  : 1,
                        message : err
                    });
                }
                res.json({
                    status  : 0,
                    message : 'Page Saved'
                });
            });
        });

        app.post('/lk-delete', isAuthenticated, function (req, res, next) {
            var req_file     = req.body.file.split('/');
            var fileCategory = '';
            var fileName     = '/' + sanitize(req_file[1]);
            if (req_file.length > 2) {
                fileCategory   = '/' + sanitize(req_file[1]);
                fileName       = '/' + sanitize(req_file[2]);
            }
            var filePath     = path.normalize(lookup.config.content_dir + fileCategory + fileName);
            if (!fs.existsSync(filePath)) { filePath += '.md'; }
            fs.rename(filePath, filePath + '.del', function (err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status: 1,
                        message: err
                    });
                }
                res.json({
                    status: 0,
                    message: 'Page Deleted'
                });
            });
        });

        app.post('/lk-add-category', isAuthenticated, function (req, res, next) {
            var fileCategory = '/' + sanitize(req.body.category);
            var filePath     = path.normalize(lookup.config.content_dir + fileCategory);
            fs.mkdir(filePath, function (err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status  : 1,
                        message : err
                    });
                }
                res.json({
                    status  : 0,
                    message : 'Category Created'
                });
            });
        });

        app.post('/lk-add-page', isAuthenticated, function (req, res, next) {
            var fileCategory = '';
            if (req.body.category) {
                fileCategory   = '/' + sanitize(req.body.category);
            }
            var fileName     = '/' + sanitize(req.body.name + '.md');
            var filePath     = path.normalize(lookup.config.content_dir + fileCategory + fileName);
            fs.open(filePath, 'a', function (err, fd) {
                fs.close(fd);
                if (err) {
                    console.log(err);
                    return res.json({
                        status  : 1,
                        message : err
                    });
                }
                res.json({
                    status  : 0,
                    message : 'Page Created'
                });
            });
        });

    }

    // Router for / and /index with or without search parameter
    app.get("/:var(index)?", function(req, res, next){
        if (req.query.search) {

            var searchQuery    = validator.toString(validator.escape(_s.stripTags(req.query.search))).trim();
            var searchResults  = lookup.doSearch(searchQuery);
            var pageListSearch = remove_image_content_directory(config, lookup.getPages(''));

            // TODO: Move to Lookup Core
            // Loop through Results and Extract Category
            searchResults.forEach(function (result) {
                result.category = null;
                var split = result.slug.split('/');
                if (split.length > 1) {
                    result.category = split[0];
                }
            });

            return res.render('search', {
                config: config,
                pages: pageListSearch,
                search: searchQuery,
                searchResults: searchResults,
                body_class: 'page-search',
                loggedIn: (config.authentication ? req.session.loggedIn : false)
            });

        } else {
            var suffix = 'edit';
            var slug = req.params[0];
            if (slug === '/') { slug = '/index'; }

            var pageList     = remove_image_content_directory(config, lookup.getPages(slug));
            var filePath     = path.normalize(lookup.config.content_dir + slug);
            var filePathOrig = filePath;

            if (filePath.indexOf(suffix, filePath.length - suffix.length) !== -1) {
                filePath = filePath.slice(0, - suffix.length - 1);
            }
            var stat = fs.lstatSync(path.join(config.theme_dir, config.theme_name, 'templates', 'home.html'));

            return res.render('home', {
                config        : config,
                pages         : pageList,
                body_class    : 'page-home',
                meta          : config.home_meta,
                last_modified : moment(stat.mtime).format('Do MMM YYYY'),
                loggedIn: (config.authentication ? req.session.loggedIn : false)
            });
        }
    });

    app.get(/^([^.]*)/, function (req, res, next) {
        var suffix = 'edit';

        if (req.params[0]) {

            var slug = req.params[0];

            var pageList     = remove_image_content_directory(config, lookup.getPages(slug));
            var filePath     = path.normalize(lookup.config.content_dir + slug);
            var filePathOrig = filePath;

            if (filePath.indexOf(suffix, filePath.length - suffix.length) !== -1) {
                filePath = filePath.slice(0, - suffix.length - 1);
            }
            if (!fs.existsSync(filePath)) { filePath += '.md'; }

            if (filePathOrig.indexOf(suffix, filePathOrig.length - suffix.length) !== -1) {

                fs.readFile(filePath, 'utf8', function (err, content) {
                    if (config.authentication === true && ! req.session.loggedIn) {
                        res.redirect("/login");
                        return;
                    }

                    if (err) {
                        err.status = '404';
                        err.message = 'Whoops. Looks like this page doesn\'t exist.';
                        return next(err);
                    }

                    if (path.extname(filePath) === '.md') {

                        // File info
                        var stat = fs.lstatSync(filePath);
                        // Meta
                        var meta = lookup.processMeta(content);
                        content = lookup.stripMeta(content);
                        if (!meta.title) { meta.title = lookup.slugToTitle(filePath); }

                        // Content
                        content      = lookup.processVars(content);
                        var html     = content;
                        var template = meta.template || 'page';

                        return res.render('edit', {
                            config: config,
                            pages: pageList,
                            meta: meta,
                            content: html,
                            body_class: template + '-' + lookup.cleanString(slug),
                            last_modified: moment(stat.mtime).format('Do MMM YYYY'),
                            loggedIn: (config.authentication ? req.session.loggedIn : false)
                        });

                    }
                });

            } else {

                fs.readFile(filePath, 'utf8', function (err, content) {

                    if (err) {
                        err.status = '404';
                        err.message = 'Whoops. Looks like this page doesn\'t exist.';
                        return next(err);
                    }

                    // Process Markdown files
                    if (path.extname(filePath) === '.md') {

                        // File info
                        var stat = fs.lstatSync(filePath);

                        // Meta
                        var meta = lookup.processMeta(content);
                        content = lookup.stripMeta(content);
                        if (!meta.title) { meta.title = lookup.slugToTitle(filePath); }

                        // Content
                        content = lookup.processVars(content);
                        // BEGIN: DISPLAY, NOT EDIT
                        marked.setOptions({
                            langPrefix: ''
                        });
                        var html = marked(content);
                        // END: DISPLAY, NOT EDIT
                        var template = meta.template || 'page';

                        return res.render(template, {
                            config: config,
                            pages: pageList,
                            meta: meta,
                            content: html,
                            body_class: template + '-' + lookup.cleanString(slug),
                            last_modified: moment(stat.mtime).format('Do MMM YYYY'),
                            loggedIn: (config.authentication ? req.session.loggedIn : false)
                        });

                    }
                });
            }
        } else {
            next();
        }
    });

    app.use(error_handler);

    return app;

}

// Exports
module.exports = initialize;
