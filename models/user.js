'use strict'

var mongoose = require('mongoose');
var model = require('./model.js');
var Post = require('./post.js');
var Thread = require('./thread.js');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    created_at: Date,
    updated_at: Date
});

var hashPassword = function hashPassword(next) {
    if (!this.isModified('password'))
        return next();
    else {
        var hash = crypto.createHash('sha512').update(this.password).digest("hex");
        this.password = hash;
        return next();
    }
}

var deleteAllMyPosts = function deleteAllMyPosts(next) {
    Post.remove({
        _owner: this._id
    });
}

var deleteAllMyThreads = function deleteAllMyThreads(next) {
    Thread.remove({
        _owner: this._id
    });
}

userSchema.pre('save', hashPassword, model.updateTimestamps);
userSchema.pre('remove', deleteAllMyPosts, deleteAllMyThreads);

var User = mongoose.model('User', userSchema);
module.exports = User;
