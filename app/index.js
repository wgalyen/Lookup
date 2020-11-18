'use strict';

// Modules
var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookie_parser = require('cookie-parser');
var body_parser = require('body-parser');
var _s = require('underscore.string');
var moment = require('moment');
var marked = require('marked');
var validator = require('validator');
var extend = require('extend');
var hogan = require('hogan-express');
var session = require('express-session');
var sanitize = require('sanitize-filename');
var lookup = require('lookup-core');

function initialize (config) {

    // Setup config
    extend(lookup.config, config);

    // Load Files
    var authenticate = require('./middleware/authenticate.js')(config);
    var error_handler = require('./middleware/error_handler.js')(config);
    var route_login = require('./routes/login.route.js')(config);
    var route_login_page = require('./routes/login_page.route.js')(config);
    var route_logout = require('./routes/logout.route.js');
    var route_page_edit = require('./routes/page.edit.route.js')(config, lookup);
    var route_page_delete = require('./routes/page.delete.route.js')(config, lookup);
    var route_page_create = require('./routes/page.create.route.js')(config, lookup);
    var route_category_create = require('./routes/category.create.route.js')(config, lookup);
    var route_search = require('./routes/search.route.js')(config, lookup);
    var route_home            = require('./routes/home.route.js')            (config, lookup);

    // New Express App
    var app = express();

    // Setup Port
    app.set('port', process.env.PORT || 3000);

    // Setup Views
    if (!config.theme_dir) { config.theme_dir = path.join(__dirname, '..', 'themes'); }
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
    app.use(body_parser.urlencoded({ extended: false }));
    app.use(cookie_parser());
    app.use(express.static(config.public_dir));
    app.use(config.image_url, express.static(path.normalize(config.content_dir + config.image_url)));

    // HTTP Authentication
    if (config.authentication === true) {
        app.use(session({
            secret: 'changeme',
            name: 'lookup.sid',
            resave: false,
            saveUninitialized: false
        }));
        app.post('/lk-login', route_login);
        app.get('/login', route_login_page);
        app.get('/logout', route_logout);
    }

    // Online Editor Routes
    if (config.allow_editing === true) {
        app.post('/lk-edit', authenticate, route_page_edit);
        app.post('/lk-delete', authenticate, route_page_delete);
        app.post('/lk-add-page', authenticate, route_page_create);
        app.post('/lk-add-category', authenticate, route_category_create);
    }

    // Router for / and /index with or without search parameter
    app.get("/:var(index)?", route_search, route_home);

    app.get(/^([^.]*)/, function (req, res, next) {
        var suffix = 'edit';

        if (req.params[0]) {

            var slug = req.params[0];
            if (slug === '/') { slug = '/index'; }

            var pageList = remove_image_content_directory(config, lookup.getPages(slug));
            var filePath = path.normalize(lookup.config.content_dir + slug);
            var filePathOrig = filePath;

            if (filePath.indexOf(suffix, filePath.length - suffix.length) !== -1) {
                filePath = filePath.slice(0, -suffix.length - 1);
            }
            if (!fs.existsSync(filePath)) { filePath += '.md'; }

            if (filePathOrig.indexOf(suffix, filePathOrig.length - suffix.length) !== -1) {

                fs.readFile(filePath, 'utf8', function (err, content) {
                    if (config.authentication === true && !req.session.loggedIn) {
                        res.redirect('/login');
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
                        content = lookup.processVars(content);
                        var html = content;
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
