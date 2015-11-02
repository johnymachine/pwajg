'use strict'
var threadsRouter = require('express').Router();
var Thread = require('../models/thread.js');
var Post = require('../models/post.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;
var sanetizePagination = require('../middlewares/sanetizePagination.js').sanetizePagination;

threadsRouter
    .param('thread_id', function(req, res, next, thread_id) {
        Thread
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
    if (res.locals.thread._owner.equals(res.locals.me._id)) {
        return next();
    } else
        res.sendStatus(403);
};

// use authorization on all routes
threadsRouter.use(isTokenValid);

// application router for /threads
threadsRouter.route('/')
    // midleware for all threads routes
    .all(function(req, res, next) {
        return next();
    })
    // get all threads
    .get(sanetizePagination, function(req, res, next) {
        Thread
            .find()
            .count(function(err, count) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else if (count) {
                    Thread
                        .find()
                        .sort({
                            created_on: res.locals.order
                        })
                        .skip((res.locals.page - 1) * res.locals.size)
                        .limit(res.locals.size)
                        .exec(function(err, threads) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            } else if (threads) {
                                res.setHeader("Count", count);
                                res.setHeader("Page", res.locals.page);
                                res.setHeader("Pages", Math.ceil(count / res.locals.size));
                                res.setHeader("Size", res.locals.size);
                                res.json(threads);
                            } else
                                res.sendStatus(404);
                        });
                } else
                    res.sendStatus(404);
            });
    })
    // create new thread
    .post(function(req, res, next) {
        var thread = new Thread({
            text: req.body.text,
            _owner: res.locals.me._id
        });
        thread.save(function(err, thread) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) res.sendStatus(409);
                else res.sendStatus(500);
            } else {
                res.status(201).json(thread);
            }
        });
    });


// application router for /threads/:thread_id
threadsRouter.route('/:thread_id')
    // midleware for all /threads/:thread_id routes
    .all(function(req, res, next) {
        return next();
    })
    .get(function(req, res, next) {
        res.json(res.locals.thread);
    })
    // update thread if you are owner
    .put(checkUserIsThreadOwner, function(req, res, next) {
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
    .delete(checkUserIsThreadOwner, function(req, res, next) {
        Thread
            .findById(res.locals.thread._id)
            .remove(function(err) {
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
    .post(function(req, res, next) {
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
                res.status(201).json(post);
            }
        });
    })
    // get all post in thread
    .get(sanetizePagination, function(req, res, next) {
        var criteria = {
            _thread: res.locals.thread._id
        };
        Post
            .find(criteria)
            .count(function(err, count) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else if (count) {
                    Post
                        .find(criteria)
                        .sort({
                            created_on: res.locals.order
                        })
                        .skip((res.locals.page - 1) * res.locals.size)
                        .limit(res.locals.size)
                        .exec(function(err, threads) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            } else if (threads) {
                                res.setHeader("Count", count);
                                res.setHeader("Page", res.locals.page);
                                res.setHeader("Pages", Math.ceil(count / res.locals.size));
                                res.setHeader("Size", res.locals.size);
                                res.json(threads);
                            } else
                                res.sendStatus(404);
                        });
                } else
                    res.sendStatus(404);
            });
    });

module.exports = threadsRouter;
