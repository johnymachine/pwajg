'use strict'
var usersRouter = require('express').Router();
var User = require('../models/user.js');

var hash = require('../util/hash.js');
var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

usersRouter
    .param('user_id', function(req, res, next, user_id) {
        User
            .findOne({
                '_id': user_id
            })
            .select('-password -__v')
            .exec(function(err, user) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else if (user) {
                    res.locals.user = user;
                    return next();
                } else
                    res.sendStatus(404);
            });
    })

var checkUserIsMe = function checkUserIsMe(req, res, next) {
    if (res.locals.user._id == res.locals.me._id) {
        return next();
    } else
        res.sendStatus(403);
};

// application router for /users/
usersRouter.route('/')
    // midleware for all /users routes
    .all(function(req, res, next) {
        return next();
    })
    //get all users
    .get(isTokenValid, function(req, res, next) {
        User
            .find()
            .select('-password -__v')
            .exec(function(err, users) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else if (users)
                    res.json(users);
                else
                    res.sendStatus(404);
            });
    })
    // create new user
    .post(function(req, res, next) {
        var user = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        user.save(function(err, user) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) res.sendStatus(409);
                else res.sendStatus(500);
            } else {
                user.password = undefined;
                user.__v = undefined;
                res.status(201).json(user);
            }
        });
    });

// use authorization on all /:user_id routes
usersRouter.use('/:user_id', isTokenValid);

usersRouter.route('/:user_id')
    // midleware for all users/:user_id routes
    .all(function(req, res, next) {
        return next();
    })
    // get user by id
    .get(function(req, res, next) {
        res.json(res.locals.user);
    })
    // update my user info
    .put(checkUserIsMe, function(req, res, next) {
        if (req.body.name) res.locals.user.name = req.body.name;
        if (req.body.email) res.locals.user.email = req.body.email;
        if (req.body.username) res.locals.user.username = req.body.username;
        if (req.body.password) res.locals.user.password = req.body.password;
        res.locals.user.save(function(err, user) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) res.sendStatus(409);
                else res.sendStatus(500);
            } else {
                res.locals.me = user;
                res.locals.user = user;
                res.locals.auth._owner = user;
                user.password = undefined;
                user.__v = undefined;
                res.json(user);
            }
        });
    })
    // delete myself
    .delete(checkUserIsMe, function(req, res, next) {
        res.locals.user.remove(function(err) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.locals.me = null;
                res.locals.user = null;
                res.locals.auth = null;
            }
        });
    });

module.exports = usersRouter;
