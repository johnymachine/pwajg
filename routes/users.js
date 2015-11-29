'use strict'
var usersRouter = require('express').Router();
var User = require('../models/user.js');

var hash = require('../util/hash.js');
var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;
var sanetizePagination = require('../middlewares/sanetizePagination.js').sanetizePagination;

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
                    return res.sendStatus(500);
                } else if (user) {
                    res.locals.user = user;
                    return next();
                } else {
                    return res.sendStatus(404);
                }
            });
    });

var checkUserIsMe = function checkUserIsMe(req, res, next) {
    if (res.locals.user._id.equals(res.locals.me._id)) {
        return next();
    } else
        return res.sendStatus(403);
};

// application router for /users/
usersRouter.route('/')
    // midleware for all /users routes
    .all(function(req, res, next) {
        return next();
    })
    //get all users
    .get(isTokenValid, sanetizePagination, function(req, res, next) {
        User
            .find()
            .count(function(err, count) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else if (count) {
                    User
                        .find()
                        .sort({
                            created_at: res.locals.order
                        })
                        .skip((res.locals.page - 1) * res.locals.size)
                        .limit(res.locals.size)
                        .exec(function(err, users) {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            } else if (users) {
                                res.setHeader("count", count);
                                res.setHeader("page", res.locals.page);
                                res.setHeader("pages", Math.ceil(count / res.locals.size));
                                res.setHeader("size", res.locals.size);
                                return res.status(200).json(users);
                            } else {
                                return res.sendStatus(500);
                            }
                        });
                } else {
                    res.setHeader("count", 0);
                    res.setHeader("page", 0);
                    res.setHeader("pages", 0);
                    res.setHeader("size", res.locals.size);
                    return res.status(200).json([]);
                }
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
                if (err["code"] == 11000) {
                    return res.sendStatus(409);
                } else {
                    return res.sendStatus(500);
                }
            } else {
                user.password = undefined;
                return res.status(201).json(user);
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
        return res.status(200).json(res.locals.user);
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
                if (err["code"] == 11000) {
                    return res.sendStatus(409);
                } else {
                    return res.sendStatus(500);
                }
            } else {
                user.password = undefined;
                return res.status(200).json(user);
            }
        });
    })
    // delete myself
    .delete(checkUserIsMe, function(req, res, next) {
        res.locals.user.remove(function(err) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            } else {
                return res.sendStatus(204);
            }
        });
    });

module.exports = usersRouter;
