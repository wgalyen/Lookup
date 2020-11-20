'use strict';

// Modules
var url = require('url');
var path = require('path');
var fs = require('fs');
var sm = require('sitemap');

function route_sitemap(config, lookup) {
  return function (req, res, next) {
      var hostname = req.headers.host;

      var content_dir = path.normalize(lookup.config.content_dir);

      // get list md files
      var files = listFiles(content_dir, '.md');
      files = files.map(function (file) {
          return file.replace(content_dir, '');
      });

      // generate list urls
      var urls = files.map(function (file) {
          return '/' + file.replace('.md', '').replace('\\', '/');
      });

      // create sitemap.xml
      var sitemap = sm.createSitemap({
          hostname: 'http://' + hostname,
          cacheTime: 600000
      });

      for (var i = 0, len = urls.length; i < len; i++) {
          sitemap.add({
              url: urls[i],
              changefreq: 'weekly',
              priority: 0.8
          });
      }

      res.header('Content-Type', 'application/xml');
      res.send(sitemap.toString());
  };
}

function listFiles(dir, suffix) {
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        return list.concat(isDir ? listFiles(name) : [name]);
    }, []);
}

// Exports
module.exports = route_sitemap;
