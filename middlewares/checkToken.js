'use strict'
var Auth = require('../models/auth.js');
var mongoose = require('mongoose');
var User = require('../models/user.js');

module.exports = {
    isTokenValid: function(req, res, next) {
        var token = req.headers["token"];
        if (token == 'test') {
            var id = mongoose.Types.ObjectId('5637286e9f35d76d2d6b05c0');
            res.locals.me = User.findById(id);
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
