'use strict'
var mongoose = require('mongoose');
var model = require('./model.js');
var Post = require('./post.js');

var Schema = mongoose.Schema;

var threadSchema = new Schema({
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true,
        unique: true
    },
    created_at: Date,
    updated_at: Date,
    __v: {
        type: Number,
        select: false
    }
});

var deleteAllThreadPosts = function deleteAllThreadPosts(next) {
    Post.remove({
        _thread: this._id
    });
    return next();
}

threadSchema.pre('save', model.updateTimestamps);
threadSchema.pre('remove', deleteAllThreadPosts);

var Thread = mongoose.model('Thread', threadSchema);
module.exports = Thread;
