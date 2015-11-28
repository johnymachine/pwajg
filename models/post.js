'use strict'
var mongoose = require('mongoose');
var model = require('./model.js');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _thread: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true
    },
    is_main: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        required: true
    },
    created_at: Date,
    updated_at: Date
});

postSchema.pre('save', model.updateTimestamps);

var Post = mongoose.model('Post', postSchema);
module.exports = Post;
