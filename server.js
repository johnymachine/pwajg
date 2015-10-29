'use strict'

// env vars
var uri = process.env.MONGOLAB_URI;
var port = process.env.PORT || 8080;

//required
var express = require('express');
var app = express();
var bodyParser = require('body-parser')

// app routers
var router = express.Router();
var authRouter = require('./routes/auth.js');
var usersRouter = require('./routes/users.js');
var threadsRouter = require('./routes/threads.js');
var postsRouter = require('./routes/posts.js');

//mongoose
var mongoose = require('mongoose');

//connect to mongodb
mongoose.connect(uri, function(err, res) {
    if (err) {
        console.log("Error connecting to Mongodb: " + err);
    } else {
        console.log("Successfully connected to Mongodb.");
    }
});

// set up body parser
app.use(bodyParser.json())

// root with API docs
router.get('/', function(req, res) {
    res.json({
        welcome: "Welcome to discusion board API!",
        url: "http://pwajg-server.herokuapp.com/'",
        apiary: "http://docs.pwajg.apiary.io/",
        github: "https://github.com/johnymachine/pwajg-server"
    });
});

// bind routes
router.use('/auth/', authRouter);
router.use('/users/', usersRouter);
router.use('/threads/', threadsRouter);
router.use('/posts/', postsRouter);

// bind main router and make prefix /apiv1
app.use("/apiv1", router);

// start server
app.listen(port);
console.log("Server is running on port: " + port);
