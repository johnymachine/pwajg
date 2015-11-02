'use strict'
var crypto = require('crypto');

module.exports = {
    getGravatarUrl: function(text) {
        return "http://www.gravatar.com/avatar/" + crypto.createHash('md5').update(text).digest("hex");
    }
}
