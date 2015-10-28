'use strict'

var threadsRouter = require('express').Router();
var Thread = require('../models/thread.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

// application router for /threads/
threadsRouter.route('/')
    // midleware for all threads routes
    .all(function(req, res, next) {
        next();
    })

// get all threads
.get(isTokenValid, function(req, res, next) {
    var page = req.query.page || 1;
    var itemsOnPage = 20;
    Thread
        .find()
        .skip((page - 1) * itemsOnPage)
        .limit(itemsOnPage)
        .exec(function(err, thread) {
            if (err)
                res.sendStatus(500);
            if (thread)
                res.json(thread);
            else
                res.sendStatus(404);
        });
})

.post(isTokenValid, function(req, res, next) {});


// application router for /threads/:thread_id
threadsRouter.route('/:thread_id')
    // midleware for all threads routes
    .all(function(req, res, next) {
        next();
    })

// get thread by id
.get(isTokenValid, function(req, res, next) {})

// delete thread by id
.delete(isTokenValid, function(req, res, next) {});


// application router for /:thread_id/posts
threadsRouter.route('/:thread_id/posts')
    // midleware for all threads routes
    .all(function(req, res, next) {
        next();
    })
    .post(isTokenValid, function(req, res, next) {})
    .get(isTokenValid, function(req, res, next) {});

// application router for //threads/:thread_id/posts/:post_id
threadsRouter.route('/:thread_id')
    // midleware for all threads routes
    .all(function(req, res, next) {
        next();
    })
    .delete(isTokenValid, function(req, res, next) {});

module.exports = threadsRouter;
