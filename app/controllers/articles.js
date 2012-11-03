
var mongoose = require('mongoose')
  , Article = mongoose.model('Article')
  , _ = require('underscore')
  , async = require('async');
// New article
exports.new = function (req, res) {
    res.render('articles/new', {
        title: 'New Article'
      , article: new Article({})
    });
};
// Create an article
exports.create = function (req, res) {
    var article = new Article(req.body);
    article.user = req.user;
    article.save(function (err) {
        if (err) {
            res.render('articles/new', {
                title: 'New Article'
              , article: article
              , errors: err.errors
            });
        }
        else {
            res.redirect('/articles/' + article._id);
        }
    });
};
// Edit an article
exports.edit = function (req, res) {
    res.render('articles/edit', {
        title: 'Edit ' + req.article.title,
        article: req.article
    });
};
// Update article
exports.update = function (req, res) {
    var article = req.article;
    article = _.extend(article, req.body);
    article.save(function (err, doc) {
        if (err) {
            res.render('articles/edit', {
                title: 'Edit Article'
              , article: article
              , errors: err.errors
            });
        }
        else {
            res.redirect('/articles/' + article._id);
        }
    });
};
// View an article
exports.show = function (req, res) {
    res.render('articles/show', {
        title: req.article.title,
        article: req.article,
        comments: req.comments
    });
};
// Delete an article
exports.destroy = function (req, res) {
    var article = req.article;
    article.remove(function (err) {
        // req.flash('notice', 'Deleted successfully')
        res.redirect('/articles');
    });
};
// Listing of Articles
exports.index = function (req, res) {
    var perPage = 3
      , page = req.param('page') > 0 ? req.param('page') : 0;
    Article
    .find({})
    .populate('user', 'name')
    .sort({ 'category': 1 }) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function (err, articles) {
        if (err) return res.render('500');
        Article.count().exec(function (err, count) {
            res.render('articles/index', {
                title: 'List of Articles'
              , articles: articles
              , page: page
              , pages: count / perPage
            });
        });
    });
};
// Listing of Articles
exports.homeListing = function (req, res) {
  var perPage = 3
    , page = req.param('page') > 0 ? req.param('page') : 0;
  Article
    .distinct('category')
    .sort({'category': -1})
    .exec(function onQueryResult(err, categories) {
      if (err) return res.render('500');
      console.log('categories: %j', categories);

      var categoryArticles = [];

      var articlesByCategory = function(category, callback) {
        console.log('category: ' + category);
        Article
          .find({'category': category})
          .populate('user', 'name')
          .sort({ 'createdAt': -1 }) // sort by date
          .limit(perPage)
          .exec(function (err, articles) {
            if (err) return res.render('500');
            console.log('category %s and articles: %d', category, articles.length);
            categoryArticles.push({ 'category': category, 'articles': articles });
            console.log('pushed');
            callback();
          });
      };

      async.forEach(categories, articlesByCategory, function(err) {
        console.log('categories found: %d', categoryArticles.length);
        res.render('articles/home', {
          title: 'List of Articles'
          , categoryArticles: categoryArticles
          , page: page
          , pages: 0
        });
      });
    });
};
