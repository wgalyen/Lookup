'use strict';

// Modules
var validator                      = require('validator');
var _s                             = require('underscore.string');
var remove_image_content_directory = require('../functions/remove_image_content_directory.js');

function route_search (config, lookup) {
    return function (req, res, next) {

        // Skip if Search not present
        if (!req.query.search) { return next(); }

        // remove < and >
        var tagFreeQuery   = _s.stripTags(req.query.search);

        // remove /, ', " and & from query
        var invalidChars   = '&\'"/';
        var sanitizedQuery = validator.blacklist(tagFreeQuery, invalidChars);

        // trim and and convert string
        var searchQuery    = validator.toString(sanitizedQuery).trim();

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
            config        : config,
            pages         : pageListSearch,
            search        : searchQuery,
            searchResults : searchResults,
            body_class    : 'page-search',
            lang          : config.lang,
            loggedIn      : ((config.authentication || config.authentication_for_edit) ? req.session.loggedIn : false),
            username      : (config.authentication ? req.session.username : null)

        });

    };
}

// Exports
module.exports = route_search;
