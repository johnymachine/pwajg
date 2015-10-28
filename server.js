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
var isTokenValid = require('./middlewares/checkToken.js').isTokenValid;

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

// bind main router and make prefix /apiv1
app.use("/apiv1", router);

// start server
app.listen(port);
console.log("Server is running on port: " + port);
