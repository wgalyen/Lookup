# Lookup Changelog

v0.11.0
==================

  * **[New]** Google OAuth Support
  * **[New]** Authentication for Edit (Public Read-Only)
  * **[New]** Dynamic Sitemap.xml
  * **[New]** Custom Variables
  * **[Improvement]** Multiple User Login
  * **[Improvement]** Table of Contents (Dynamic)
  * **[Misc]** Merged `Lookup-Core` module into repository
  * **[Misc]** Dependency upgrades

v0.10.1
====================

  * **[New]** Language Translations!
    - Right to Left support
  * **[New]** Docker support
  * **[Improvement]** Better small-screen layout that automatically hides the left menu
  * **[Misc]** Upgrading lookup-core from v0.4.0 to v0.5.0


v0.10.0
====================

  * **[New]** Language Translations!
  * **[New]** Metadata is editable
  * **[Fixed] General BugFixes contributed by

v0.9.0
===================

  * **[Fixed]** Embedding images in content
  * **[Fixed]** Custom homepage via index.md file
  * **[Fixed]** Sanitizing file paths
  * **[New]** Authentication on Changes Only
  * **[New]** Category in Search Results
  * **[New]** Metadata on homepage
  * **[Upgraded]** Module lookup-core from v0.2.0 to v0.4.0
  * **[Upgraded]** Other Dependencies
  * **[Misc]** Broke up code into multiple files
  * **[Misc]** Delinted Code
  * **[Misc]** Overall refactor

v0.8.0
===================

  * **[Fixed]** URI Decoding with non-Latin characters
  * **[Fixed]** Windows compatibility (use `npm run start_win`)
  * **[New]** Added Login Page to replace HTTP Basic Auth
  * **[New]** Added ability to run Lookup as a PM2 service
  * **[New]** Main Articles is now a category editable in the UI
  * **[New]** Using NPM for client-side libraries
  * **[Upgraded]** Improved Live Editor layout
  * **[Removed]** Bower for client-side libraries

v0.7.1
===================

  * **[New]** Theme support. Copy `themes/default/` to `themes/<new name>/` and edit.
  * **[New]** Added toggle for enabling online editing of pages
  * **[New]** Preparing for Lookup to be NPM-installable (see example/ for new usage)
  * **[New]** Codified Bower dependencies into bower.json
  * **[Upgraded]** Upgraded Bower modules in bower.json (current)
  * **[Upgraded]** Upgraded Node.js modules in package.json (current)
  * **[Removed]** ./bin/www script. Replace with "npm start"
  * **[Removed]** Unused modules

v0.7.0
===================

  * **[New]** Added online editing of pages

  * **[New]** Added HTTP Basic authentication

  * **[New]** Added custom template layouts

  * **[Fixed]** Highlight.js language detection

  * **[Fixed]** Mobile design layout

  * **[Fixed]** Added config.base_url in front of all assets

v0.6.0
==========================

  * **[Changed]** Static files (e.g. images) can now be served from the content folder
  * **[Changed]** Removed licensing

v0.5.0
==========================

  * **[New]** Changed app structure (now using lookup-core)
  * **[New]** Added a content_dir config option
  * **[New]** Added an analytics config option

v0.4.0
==========================

  * **[New]** Added %image_url% support to Markdown files
  * **[New]** Search queries are now highlighted in search results
  * **[Changed]** Fallback to generating title from filename if no meta title is set
  * **[Changed]** Moved route and error handlers to lookup.js
  * **[Changed]** Make search use "/" URL
  * **[Fixed]** Fixed __dirname paths in Windows

v0.3.0
==========================

  * **[New]** Added masonry layout functionality to homepage
  * **[New]** Added licensing

v0.2.0
==========================

  * **[New]** Added page and category sorting functionality
  * **[Fixed]** Added better handling of file reading errors in lookup.js

v0.1.2
==========================

  * **[Changed]** Changed default copyright in config.js

v0.1.1
==========================

  * **[Fixed]** Error page

v0.1.0
==========================

  * Initial release
