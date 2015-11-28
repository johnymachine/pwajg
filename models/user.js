'use strict'
var mongoose = require('mongoose');
var model = require('./model.js');
var Post = require('./post.js');
var Thread = require('./thread.js');
var hash = require('../util/hash.js');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        default: 'John Doe'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
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
        this.password = hash.getHash(this.password);
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

var deleteMyAuth = function deleteAllMyThreads(next) {
    Auth.remove({
        _owner: this._id
    });
}

userSchema.pre('save', hashPassword, model.updateTimestamps);
userSchema.pre('remove', deleteAllMyPosts, deleteAllMyThreads, deleteMyAuth);

var User = mongoose.model('User', userSchema);
module.exports = User;
