'use strict'

var mongoose = require('mongoose');
var model = require('./model.js');
var Schema = mongoose.Schema;

var authSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: Date,
    updated_at: Date
});

authSchema.pre('save', model.updateTimestamps);

var Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
