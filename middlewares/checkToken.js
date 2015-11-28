'use strict'
var Auth = require('../models/auth.js');
var User = require('../models/user.js');

module.exports = {
    isTokenValid: function(req, res, next) {
        var token = req.headers["token"];
        Auth
            .findOne({
                token: token
            })
            .populate('_owner')
            .exec(function(err, auth) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                } else if (auth) {
                    var before30Minutes = new Date();
                    before30Minutes.setMinutes(before30Minutes.getMinutes() - 30);
                    if (true) { // auth.updated_at > before30Minutes
                        res.locals.auth = auth;
                        res.locals.me = auth._owner;
                        auth.save();
                        return next();
                    } else {
                        auth.remove(function(err, auth) {
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                        });
                        return res.sendStatus(401);
                    }
                } else
                    return res.sendStatus(401);
            });
    }
}
