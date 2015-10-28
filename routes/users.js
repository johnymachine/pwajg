'use strict'

var usersRouter = require('express').Router();
var User = require('../models/user.js');

var hash = require('../util/hash.js');
var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

// application router for /users/
usersRouter.route('/')
// midleware for all users routes
.all(function(req, res, next) {
    next();
})

// create new user
.post(function(req, res, next) {
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

usersRouter.route('/:user_id')
// midleware for all users/:user_id routes
.all(function(req, res, next) {
    next();
})

// get user by id
.get(isTokenValid, function(req, res, next) {
    User
        .findOne({
            '_id': req.params.user_id
        })
        .exec(function(err, user) {
            if (err) {
                console.log(err)
                res.sendStatus(500);
            } else if (user)
                res.json(user);
            else
                res.sendStatus(404);
        });
})

// update my user info
.put(isTokenValid, function(req, res, next) {
    if (req.params.user_id != res.locals.user._id) res.sendStatus(403);
    else {
        User
            .findOne({
                '_id': req.params.user_id
            })
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else if (user) {
                    if (req.body.name) user.name = req.body.name;
                    if (req.body.username) user.username = req.body.username;
                    if (req.body.password) user.password = req.body.password;
                    user.save(function(err, user) {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                        }
                    });
                    res.locals.user = user;
                    res.locals.auth._owner = user;
                } else
                    res.sendStatus(404);
            });
    }
})

// delete myself
.delete(isTokenValid, function(req, res, next) {
    if (req.params.user_id != res.locals.user._id) res.sendStatus(403);
    else {
        res.locals.user.remove(function(err) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.locals.user = null;
                res.locals.auth = null;
            }
        });
    }
});

module.exports = usersRouter;