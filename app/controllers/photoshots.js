/**
 * Created with JetBrains WebStorm.
 * User: Ramu
 * Date: 10/28/12
 * Time: 10:37 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose')
    , Photoshot = mongoose.model('Photoshot');
exports.create = function (req, res) {
    var photoshot = new Photoshot(req.body)
        , article = req.article;
    photoshot._user = req.user;
    photoshot.save(function (err) {
        if (err) throw new Error('Error while saving comment');
        article.photoshots.push(photoshot._id);
        article.save(function (err) {
            if (err) throw new Error('Error while saving article');
            res.redirect('/articles/' + article.id + '#photoshots');
        });
    });
};
