/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express');
var fs = require('fs');
var passport = require('passport');

require('express-namespace');

// Load configurations
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var auth = require('./authorization');

// Bootstrap db connection
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models';
var model_files = fs.readdirSync(models_path);
model_files.forEach(function (file) {
    require(models_path + '/' + file);
});

// bootstrap passport config
require('./config/passport').boot(passport, config);

var app = express();                                       // express app
require('./settings').boot(app, config, passport);        // Bootstrap application settings

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
var port = process.env.PORT || 3001;
app.listen(port);
console.log('Express app started on port 1 ' + port);
