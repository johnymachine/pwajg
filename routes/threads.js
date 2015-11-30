'use strict'
var threadsRouter = require('express').Router();
var Thread = require('../models/thread.js');
var Post = require('../models/post.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;
var sanetizePagination = require('../middlewares/sanetizePagination.js').sanetizePagination;

// use authorization on all routes
threadsRouter.use(isTokenValid);

threadsRouter
    .param('thread_id', function(req, res, next, thread_id) {
        Thread
            .findOne({
                '_id': thread_id
            })
            .populate('_owner')
            .exec(function(err, thread) {
                if (err) {
                    console.log(err)
                    return res.sendStatus(500);
                } else if (thread) {
                    res.locals.thread = thread;
                    return next();
                } else
                    return res.sendStatus(404);
            });
    });

var checkUserIsThreadOwner = function checkUserIsThreadOwner(req, res, next) {
    if (res.locals.thread._owner._id.equals(res.locals.me._id)) {
        return next();
    } else
        return res.sendStatus(403);
};

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
                    return res.sendStatus(500);
                } else if (count) {
                    Thread
                        .find()
                        .sort({
                            created_at: res.locals.order
                        })
                        .skip((res.locals.page - 1) * res.locals.size)
                        .limit(res.locals.size)
                        .populate('_owner')
                        .exec(function(err, threads) {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            } else if (threads) {
                                res.setHeader("count", count);
                                res.setHeader("page", res.locals.page);
                                res.setHeader("pages", Math.ceil(count / res.locals.size));
                                res.setHeader("size", res.locals.size);
                                return res.status(200).json(threads);
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
    // create new thread
    .post(function(req, res, next) {
        var threadText = req.body.title;
        var postText = req.body.body;
        if ((threadText == "" || threadText == null) || ((postText == "" || postText == null))) {
            return res.sendStatus(400);
        }

        var thread = new Thread({
            text: threadText,
            _owner: res.locals.me._id
        });
        thread.save(function(err, thread) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) {
                    res.sendStatus(409);
                } else {
                    res.sendStatus(500);
                }
            } else if (thread) {
                var post = new Post({
                    text: postText,
                    _thread: thread._id,
                    is_main: true,
                    _owner: res.locals.me._id
                });
                post.save(function(err, post) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    } else if (post) {
                        return res.status(201).json(thread);
                    } else {
                        thread.remove();
                        return res.sendStatus(500);
                    }
                });
            } else {
                return res.sendStatus(500);
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
        return res.status(200).json(res.locals.thread);
    })
    // update thread if you are owner
    .put(checkUserIsThreadOwner, function(req, res, next) {
        res.locals.thread.text = req.body.title
        res.locals.thread.save(function(err, thread) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            } else {
                return res.status(200).json(res.locals.thread);
            }
        });
    })
    // delete post if you are owner
    .delete(checkUserIsThreadOwner, function(req, res, next) {
        res.locals.thread
            .remove(function(err) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else {
                    return res.sendStatus(204);
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
            text: req.body.body,
            _thread: res.locals.thread._id,
            _owner: res.locals.me._id
        });
        post.save(function(err, post) {
            if (err) {
                console.log(err);
                if (err["code"] == 11000) {
                    return res.sendStatus(409);
                } else {
                    return res.sendStatus(500);
                }
            } else {
                return res.status(201).json(post);
            }
        });
    })
    // get all post in thread
    .get(sanetizePagination, function(req, res, next) {
        Post
            .find({
                _thread: res.locals.thread._id
            })
            .count(function(err, count) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else if (count) {
                    Post
                        .find({
                            _thread: res.locals.thread._id
                        })
                        .sort({
                            created_at: res.locals.order
                        })
                        .skip((res.locals.page - 1) * res.locals.size)
                        .limit(res.locals.size)
                        .populate('_owner')
                        .exec(function(err, threads) {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            } else if (threads) {
                                res.setHeader("count", count);
                                res.setHeader("page", res.locals.page);
                                res.setHeader("pages", Math.ceil(count / res.locals.size));
                                res.setHeader("size", res.locals.size);
                                return res.status(200).json(threads);
                            } else {
                                return res.sendStatus(500);
                            }
                        });
                } else {
                    res.setHeader("count", 0);
                    res.setHeader("page", res.locals.page);
                    res.setHeader("pages", 0);
                    res.setHeader("size", res.locals.size);
                    return res.status(200).json([]);
                }
            });
    });

module.exports = threadsRouter;
