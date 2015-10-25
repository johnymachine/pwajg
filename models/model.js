'use strict'
var crypto = require('crypto');

module.exports = {
    updateTimestamps: function (next) {
        var currentDate = new Date();
        this.updated_at = currentDate;
        if (!this.created_at)
            this.created_at = currentDate;
        next();
    }
}
