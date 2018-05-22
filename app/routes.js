var express = require('express');
var request = require('request');
var path = require('path');
var winston = require('winston');
var jwt = require('express-jwt');
const jsonwt = require('jsonwebtoken');
var clone = require('clone');
var multer  = require('multer')
var config = require('./config');
var fs = require("fs");
var path = require("path");

var logger = new winston.Logger(config.logger.winston);

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        var dir = './uploads/'+req.params.group+'/'+req.params.id;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        //var datetimestamp = Date.now();
        //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        cb(null, file.originalname);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');




function issue_jwt(user, cb) {
    var claim = {
        iss: config.auth.iss,
        exp: (Date.now() + config.auth.ttl)/1000,
        //"iat": (Date.now())/1000, //this gets set automatically
        profile: {
            username: user.username,
        },
    };
    // console.log( jsonwt.sign(claim, config.auth.secret));
    cb(null, jsonwt.sign(claim, config.auth.secret));

}

function imagex_jwt(paths, cb){
    var claim = {
        "scopes": {"imagex": paths},
        "aud": "imagex.sca.iu.edu",
        "iat": Date.now(),
        "exp": (Date.now() + config.auth.ttl)/1000
    };

    // console.log( jsonwt.sign(claim, config.auth.imagex_secret, { algorithm: 'RS256'}));
    cb( jsonwt.sign(claim, config.auth.imagex_secret, { algorithm: 'RS256'}));
}

module.exports = function (app) {

    app.use('/node_modules', express.static(path.join(__dirname, '/../node_modules')));
    app.use('/js', express.static(path.join(__dirname, 'js')));
    app.use('/t', express.static(path.join(__dirname, 't')));
    app.use('/images', express.static(path.join(__dirname, 'images')));


    /** API path that will upload the files */
    app.post('/upload/:group/:id', function(req, res) {
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }
            console.log(req.file.filename);
            res.json({error_code:0,err_desc:null});
        })
    });


    app.get('/token/:exptype/:eid', function (req, res) {
        var paths = ['/tiles/'+req.params.exptype+'/'+req.params.eid];
        imagex_jwt(paths, function(token){
            res.json(token);
        })
    });

    app.get('/tokennew/:eid', function (req, res) {
        var paths = ['/'+req.params.eid];
        imagex_jwt(paths, function(token){
            res.json(token);
        })
    });

    // application -------------------------------------------------------------
    app.get('/*', function (req, res) {
        res.sendFile(__dirname + '/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
