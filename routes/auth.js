'use strict'
var authRouter = require('express').Router();
var Auth = require('../models/auth.js');
var User = require('../models/user.js');

var hash = require('../util/hash.js');
var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

// application router for /auth/
authRouter.route('/')
    // midleware for all auth routes
    .all(function(req, res, next) {
        return next();
    })
    // create session based on credentials and get token
    .post(function(req, res, next) {
        User
            .findOne({
                username: req.body.username,
                password: hash.getHash(req.body.password)
            })
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else if (user) {
                    var timestamp = Date();
                    var token = hash.getHash(user._id + user.name + user.username + user.password + timestamp)
                    var auth = new Auth({
                        token: token,
                        _owner: user,
                        created_at: timestamp
                    });
                    auth.save(function(err, auth) {
                        if (err) {
                            console.log(err);
                            return res.sendStatus(500);
                        } else if (auth) {
                            auth._owner = user;
                            res.status(201).json(auth);
                        } else {
                            return res.sendStatus(500);
                        }
                    });
                } else
                    return res.sendStatus(404);
            });
    })
    // gets current user
    .get(isTokenValid, function(req, res, next) {
        return res.status(200).json(res.locals.me);
    })
    // prolong token
    .put(isTokenValid, function(req, res, next) {
        return res.sendStatus(204);
    })
    // invalidate current token
    .delete(isTokenValid, function(req, res, next) {
        res.locals.auth
            .remove(function(err, auth) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else
                    return res.sendStatus(204);
            });
    });

module.exports = authRouter;
