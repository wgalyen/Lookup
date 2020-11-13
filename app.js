var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    _s = require('underscore.string'),
    moment = require('moment'),
    marked = require('marked'),
    validator = require('validator'),
    extend = require('extend'),
    lookup = require('lookup-core'),
    config = require('./config'),
    app = express();

// Setup views
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.set('view engine', 'html');
app.enable('view cache');
app.engine('html', require('hogan-express'));

// Setup Express
app.use(favicon(__dirname +'/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup config
extend(lookup.config, config);

// Handle all requests
app.all('*', function(req, res, next) {
    if(req.query.search){
        var searchQuery = validator.toString(validator.escape(_s.stripTags(req.query.search))).trim(),
            searchResults = lookup.doSearch(searchQuery),
            pageListSearch = lookup.getPages('');

        return res.render('search', {
            config: config,
            pages: pageListSearch,
            search: searchQuery,
            searchResults: searchResults,
            body_class: 'page-search'
        });
    }
    else if(req.params[0]){
        var slug = req.params[0];
        if(slug == '/') slug = '/index';

        var pageList = lookup.getPages(slug),
            filePath = path.normalize(lookup.config.content_dir + slug);
        if(!fs.existsSync(filePath)) filePath += '.md';

        if(slug == '/index' && !fs.existsSync(filePath)){
            return res.render('home', {
                config: config,
                pages: pageList,
                body_class: 'page-home'
            });
        } else {
            fs.readFile(filePath, 'utf8', function(err, content) {
                if(err){
                    err.status = '404';
                    err.message = 'Whoops. Looks like this page doesn\'t exist.';
                    return next(err);
                }

                // Process Markdown files
                if(path.extname(filePath) == '.md'){
                    // File info
                    var stat = fs.lstatSync(filePath);
                    // Meta
                    var meta = lookup.processMeta(content);
                    content = lookup.stripMeta(content);
                    if(!meta.title) meta.title = lookup.slugToTitle(filePath);
                    // Content
                    content = lookup.processVars(content);
                    var html = marked(content);
                    var template = meta.template || 'page';

                    return res.render(template, {
                        config: config,
                        pages: pageList,
                        meta: meta,
                        content: html,
                        body_class: template + '-' + lookup.cleanString(slug),
                        last_modified: moment(stat.mtime).format('Do MMM YYYY')
                    });
                } else {
                    // Serve static file
                    res.sendfile(filePath);
                }
            });
        }
    } else {
        next();
    }
});

// Handle any errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        config: config,
        status: err.status,
        message: err.message,
        error: {},
        body_class: 'page-error'
    });
});

module.exports = app;
