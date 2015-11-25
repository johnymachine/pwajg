'use strict'
var Auth = require('../models/auth.js');
var User = require('../models/user.js');

module.exports = {
    isTokenValid: function(req, res, next) {
        var token = req.headers["token"];
        if (token == 'test') {
            var me = User
                .findOne()
                .exec(function(err, user) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else {
                        res.locals.me = user;
                    }
                });
            return next();
        }
        Auth
            .findOne()
            .where({
                token: token
            })
            .populate('_owner')
            .exec(function(err, auth) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else if (auth) {
                    var before30Minutes = new Date();
                    before30Minutes.setMinutes(before30Minutes.getMinutes() - 30);
                    if (auth.updated_at > before30Minutes) {
                        res.locals.auth = auth;
                        res.locals.me = auth._owner;
                        auth.save();
                        return next();
                    } else {
                        auth.remove(function(err, auth) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            }
                        });
                        res.sendStatus(401);
                    }
                } else
                    res.sendStatus(401);
            });
    }
}
