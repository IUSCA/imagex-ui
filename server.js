// set up ======================================================================
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var path = require('path');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var request = require('request');
var cert_priv = fs.readFileSync('app/imagex.key');
var port = process.env.PORT || 8080; 				// set the port	// load the database config
var methodOverride = require('method-override');

// configuration ===============================================================
 
app.use('/public', express.static(path.join(__dirname + '/public')));
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

app.get('/favicon.ico', function(req, res) {  //return no content for favicon
    res.status(204);
});

// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
server.listen(port);

console.log("ImageX UI Demonstrator listening on port " + port);
