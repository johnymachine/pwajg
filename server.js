'use strict'

// env vars
var uri = process.env.MONGOLAB_URI;
var port = process.env.PORT || 8080;

//required
var express = require('express');
var bodyParser = require('body-parser')
var crypto = require('crypto');
var app = express();
var router = express.Router();

//set up parsing
app.use(bodyParser.json())

//mongoose
var mongoose = require('mongoose');

// mongoose models
var Auth = require('./models/auth.js');
var User = require('./models/user.js');
var Thread = require('./models/thread.js');
var Post = require('./models/post.js');

//connect to mongodb
mongoose.connect(uri, function(err, res) {
    if (err) {
        console.log("Error connecting to Mongodb:/n" + err);
    } else {
        console.log("Successfully connected to Mongodb.");
    }
});

var isTokenValid = function isTokenValid(req, res, next) {
    var token = req.headers["token"];
    var query = Auth.where({
        token: token
    });
    query.findOne()
        .populate('_owner')
        .exec(function(err, auth) {
            if (err) res.sendStatus(500);
            if (auth) {
                var before30Minutes = new Date();
                before30Minutes.setMinutes(before30Minutes.getMinutes() - 30);
                if (auth.updated_at > before30Minutes) {
                    res.locals.auth = auth;
                    res.locals.user = auth._owner;
                    auth.save();
                    next();
                } else
                    res.sendStatus(401);
            } else
                res.sendStatus(401);
        });
}

router.get('/seed', function(req, res) {
    var user = new User({
        name: 'User McUserson',
        username: 'user',
        password: 'password'
    });

    var thread = new Thread({
        body: 'Hello thread',
        _owner: user._id,
    });

    var post = new Post({
        body: 'Hello post',
        _owner: user._id,
        _thread: thread._id
    });

    user.save(function(err, user) {
        if (err)
            console.log(err)
    });
    thread.save(function(err, user) {
        if (err)
            console.log(err)
    });
    post.save(function(err, user) {
        if (err)
            console.log(err)
    });
    res.sendStatus(204);
});

// root with API docs
router.get('/', function(req, res) {
    res.json({
        welcome: "Welcome to discusion board API!",
        url: "http://pwajg-server.herokuapp.com/'",
        apiary: "http://docs.pwajg.apiary.io/",
        github: "https://github.com/johnymachine/pwajg-server"
    });
});

// auth
router.get('/auth', isTokenValid, function(req, res) {
    res.json(res.locals.user);
});

router.post('/auth', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var query = User.where({
        username: username,
        password: crypto.createHash('sha512').update(password).digest("hex")
    });
    query.findOne()
        .exec(function(err, user) {
            if (err) res.sendStatus(500);
            if (user) {
                var timestamp = Date();
                var token = crypto.createHash('sha512').update(user._id + user.name + user.username + user.password + timestamp).digest("hex")
                var auth = new Auth({
                    token: token,
                    _owner: user
                });
                auth.save();
                res.json({
                    token: token
                });
            } else
                res.sendStatus(404);
        });


});

router.put('/auth', isTokenValid, function(req, res) {
    res.sendStatus(204);
});

router.delete('/auth', isTokenValid, function(req, res) {
    res.locals.auth.remove()
    res.sendStatus(204);
});


// users
router.post('/users/', function(req, res) {
    var user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    });
    user.save(function(err, user) {
        if (err) {
            console.log(err);
            if (err["code"] == 11000) res.sendStatus(409);
            else res.sendStatus(500);
        } else res.json(user);
    });
});

router.get('/users/:user_id', isTokenValid, function(req, res) {
    var id = req.params.user_id;
    User.findById(id, function(err, user) {
        if (err)
            res.sendStatus(500);
        if (user)
            res.json(res.locals.user);
        else
            res.sendStatus(404);
    });
});

// prefix all api routes
app.use("/apiv1", router);

// start server
app.listen(port);

console.log("Server is running on port: " + port);
