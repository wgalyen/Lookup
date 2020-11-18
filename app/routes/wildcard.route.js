
'use strict';

// Modules
var path                           = require('path');
var fs                             = require('fs');
var moment                         = require('moment');
var marked                         = require('marked');
var remove_image_content_directory = require('../functions/remove_image_content_directory.js');

function route_wildcard (config, lookup) {
    return function (req, res, next) {

        // Skip if nothing matched the wildcard Regex
        if (!req.params[0]) { return next(); }

        var suffix = 'edit';
        var slug   = req.params[0];
        if (slug === '/') { slug = '/index'; }

        var filePath     = path.normalize(lookup.config.content_dir + slug);
        var filePathOrig = filePath;

        if (filePath.indexOf(suffix, filePath.length - suffix.length) !== -1) {
            filePath = filePath.slice(0, - suffix.length - 1);
        }

        if (!fs.existsSync(filePath)) { filePath += '.md'; }

        fs.readFile(filePath, 'utf8', function (error, content) {

            if (error) {
                error.status = '404';
                error.message = config.lang.error['404'];
                return next(error);
            }

            // Process Markdown files
            if (path.extname(filePath) === '.md') {

                // File info
                var stat = fs.lstatSync(filePath);

                // Meta
                var meta = lookup.processMeta(content);
                if (!meta.title) { meta.title = lookup.slugToTitle(filePath); }

                // Content
                content = lookup.stripMeta(content);
                content = lookup.processVars(content);

                var template = meta.template || 'page';
                var render   = template;

                if (filePathOrig.indexOf(suffix, filePathOrig.length - suffix.length) !== -1) {

                    // Edit Page
                    if (config.authentication === true && !req.session.loggedIn) {
                        res.redirect('/login');
                        return;
                    }
                    render  = 'edit';
                    content = content;

                } else {

                    // Render Markdown
                    marked.setOptions({
                        langPrefix : ''
                    });
                    content = marked(content);

                }

                var pageList = remove_image_content_directory(config, lookup.getPages(slug));

                return res.render(render, {
                    config        : config,
                    pages         : pageList,
                    meta          : meta,
                    content       : content,
                    body_class    : template + '-' + lookup.cleanString(slug),
                    last_modified : moment(stat.mtime).format('Do MMM YYYY'),
                    lang          : config.lang,
                    loggedIn      : (config.authentication ? req.session.loggedIn : false)
                });

            }

        });

    };
}

// Exports
module.exports = route_wildcard;
