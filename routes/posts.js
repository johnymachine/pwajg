'use strict'
var postsRouter = require('express').Router();
var Post = require('../models/post.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

// use authorization on all routes
postsRouter.use(isTokenValid);

postsRouter
    .param('post_id', function(req, res, next, post_id) {
        Post
            .findOne({
                '_id': post_id
            })
            .populate('_owner')
            .exec(function(err, post) {
                if (err) {
                    console.log(err)
                    return res.sendStatus(500);
                } else if (post) {
                    res.locals.post = post;
                    return next();
                } else {
                    return res.sendStatus(404);
                }
            });
    });

var checkUserIsPostOwner = function checkUserIsPostOwner(req, res, next) {
    if (res.locals.post._owner._id.equals(res.locals.me._id)) {
        return next();
    } else {
        return res.sendStatus(403);
    }
};

// application router for /posts/:post_id
postsRouter.route('/:post_id')
    // midleware for all /posts/:post_id routes
    .all(function(req, res, next) {
        return next();
    })
    // get post by id
    .get(function(req, res, next) {
        return res.status(200).json(res.locals.post);
    })
    // update post if you are owner
    .put(checkUserIsPostOwner, function(req, res, next) {
        res.locals.post.text = req.body.text
        res.locals.post.save(function(err, post) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            } else {
                return res.status(200).json(res.locals.post);
            }
        });
    })
    // delete post if you are owner
    .delete(checkUserIsPostOwner, function(req, res, next) {
        res.locals.post
            .remove(function(err) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else {
                    return res.sendStatus(204);
                }
            });
    });

module.exports = postsRouter;
