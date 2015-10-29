'use strict'
var threadsRouter = require('express').Router();
var Thread = require('../models/thread.js');
var Thread = require('../models/post.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

threadsRouter
    .param('thread_id', function(req, res, next, thread_id) {
        Post
            .findOne({
                '_id': thread_id
            })
            .exec(function(err, thread) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else if (thread) {
                    res.locals.thread = thread;
                    return next();
                } else
                    res.sendStatus(404);
            });
    })

var checkUserIsThreadOwner = function checkUserIsThreadOwner(req, res, next) {
    if (res.locals.thread._owner == res.locals.me._id) {
        return next();
    } else
        res.sendStatus(403);
};


// application router for /threads
threadsRouter.route('/')
    // midleware for all threads routes
    .all(function(req, res, next) {
        return next();
    })
    // get all threads
    .get(isTokenValid, function(req, res, next) {
        var page = req.query.page || 1;
        var itemsOnPage = 20;
        Thread
            .find()
            .skip((page - 1) * itemsOnPage)
            .limit(itemsOnPage)
            .exec(function(err, threads) {
                if (err)
                    res.sendStatus(500);
                if (threads)
                    res.json(threads);
                else
                    res.sendStatus(404);
            });
    })
    // create new thread
    .post(function(req, res, next) {
        var thread = new Thread({
            name: req.body.text,
            _owner: res.locals.me._id
        });
        thread.save(function(err, thread) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) res.sendStatus(409);
                else res.sendStatus(500);
            } else {
                res.json(thread);
            }
        });
    });


// application router for /threads/:thread_id
threadsRouter.route('/:thread_id')
    // midleware for all /threads/:thread_id routes
    .all(function(req, res, next) {
        return next();
    })
    .get(isTokenValid, function(req, res, next) {
        res.json(res.locals.thread);
    })
    // update thread if you are owner
    .put(isTokenValid, checkUserIsThreadOwner, function(req, res, next) {
        res.locals.thread.text = req.body.text
        res.locals.thread.save(function(err, thread) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.locals.thread = thread;
                res.json(res.locals.thread);
            }
        });
    })
    // delete post if you are owner
    .delete(isTokenValid, checkUserIsThreadOwner, function(req, res, next) {
        res.locals.thread.remove(function(err) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.sendStatus(204);
            }
        });
    });


// application router for /:thread_id/posts
threadsRouter.route('/:thread_id/posts')
    // midleware for all threads routes
    .all(function(req, res, next) {
        return next();
    })
    // post to thread
    .post(isTokenValid, function(req, res, next) {
        var post = new Post({
            text: req.body.text,
            _thread: res.locals.thread._id,
            _owner: res.locals.me._id
        });
        post.save(function(err, post) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) res.sendStatus(409);
                else res.sendStatus(500);
            } else {
                res.json(post);
            }
        });
    })
    // get all post in thread
    .get(isTokenValid, function(req, res, next) {
        Post
            .find({
                _thread: res.locals.thread._id
            })
            .exec(function(err, posts) {
                if (err)
                    res.sendStatus(500);
                if (posts)
                    res.json(posts);
                else
                    res.sendStatus(404);
            });
    });

module.exports = threadsRouter;
