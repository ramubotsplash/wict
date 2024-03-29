
/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongodb');
var path = require('path');
var fs = require('fs');

exports.loadModels = function() {
// Bootstrap models
  var models_path = __dirname + '/../models';
  var model_files = fs.readdirSync(models_path);
  model_files.forEach(function (file) {
    require(models_path + '/' + file);
  });
};

exports.cleanupLessFiles = function() {
  var lessFile = __dirname + '/public/less/metroblog.css';
  fs.unlink(lessFile, function onDelete(err) {
    if (err) console.log("failed to delete file: %s", lessFile);
    else console.log("%s file deleted", lessFile);
  });
};

exports.initialize = function (app, config, passport) {
    app.set('showStackError', true);
    app.use(express.static(__dirname + '/../../public'));
    app.use(express.logger(':method :url :status')); // set views path, template engine and default layout
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'jade');
    app.configure(function () {
        // dynamic helpers
        app.use(function (req, res, next) {
            res.locals.appName = 'Nodejs Express Mongoose Demo';
            res.locals.title = 'Nodejs Express Mongoose Demo';
            res.locals.showStack = app.showStackError;
            res.locals.req = req;
            res.locals.formatDate = function (date) {
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            };
            res.locals.stripScript = function (str) {
                return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            };
            res.locals.createPagination = function (pages, page) {
                var url = require('url')
                  , qs = require('querystring')
                  , params = qs.parse(url.parse(req.url).query)
                  , str = '';
                params.page = 0;
                var clas = page == 0 ? "active" : "no";
                str += '<li class="' + clas + '"><a href="?' + qs.stringify(params) + '">First</a></li>';
                for (var p = 1; p < pages; p++) {
                    params.page = p;
                    clas = page == p ? "active" : "no";
                    str += '<li class="' + clas + '"><a href="?' + qs.stringify(params) + '">' + p + '</a></li>';
                }
                params.page = --p;
                clas = page == params.page ? "active" : "no";
                str += '<li class="' + clas + '"><a href="?' + qs.stringify(params) + '">Last</a></li>';
                return str;
            };
            next();
        }); // cookieParser should be above session
        app.use(express.cookieParser()); // bodyParser should be above methodOverride
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.session({
            secret: 'noobjs',
            store: new MongoStore({
                url: config.db,
                collection: 'sessions'
            })
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(express.favicon()); // routes should be at the last
        app.use(app.router); // assume "not found" in the error msgs

        // use less        
        app.use(require('less-middleware')({ src: __dirname + '/../../public' }));
        app.use(express.static(path.join(__dirname, '/../../public')));

        // is a 404. this is somewhat silly, but
        // valid, you can do whatever you like, set
        // properties, use instanceof etc.
        app.use(function (err, req, res, next) {
            // treat as 404
            if (~err.message.indexOf('not found')) return next(); // log it
            console.error(err.stack); // error page
            res.status(500).render('500');
            return next();
        }); // assume 404 since no middleware responded
        app.use(function (req, res, next) {
            res.status(404).render('404', { url: req.originalUrl });
        });
    });
    app.set('showStackError', false);
};
