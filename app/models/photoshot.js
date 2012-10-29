/**
 * Created with JetBrains WebStorm.
 * User: Ramu
 * Date: 10/28/12
 * Time: 9:02 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var getTags = function (tags) {
    return tags.join(',');
};

var setTags = function (tags) {
    return tags.split(',');
};

var PhotoshotSchema = new Schema({
    title: {type : String, default : '', trim : true}
    , body: {type : String, default : ''}
    , shotoriginal: {type : String, default : ''}
    , shotsmall: {type : String, default : ''}
    , shotmedium: {type : String, default : ''}
    , shotlarge: {type : String, default : ''}
    , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
    , tags: {type: [], get: getTags, set: setTags}
    , _user: {type : Schema.ObjectId, ref : 'User'}
    , createdAt: {type : Date, default : Date.now}
    , user: {}
});

mongoose.model('Photoshot', PhotoshotSchema);
