'use strict'
var crypto = require('crypto');

module.exports = {
    getHash: function(text) {
        return crypto.createHash('sha512').update(text).digest("hex");
    }
}
