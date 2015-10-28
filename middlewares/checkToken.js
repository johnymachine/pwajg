var Auth = require('../models/auth.js');

module.exports = {
    isTokenValid: function(req, res, next) {
        var token = req.headers["token"];
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
                        res.locals.user = auth._owner;
                        auth.save();
                        next();
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
