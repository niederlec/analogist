var router   = require('express').Router();
var mongo    = require('../lib/mongo.js');
var ObjectID = require('mongodb').ObjectID;

/* GET a platform. */
router.get('/:cid', function(req, res, next) {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, function (err, doc) {
    if (err)  { return next(err); }
    if (!doc) { return res.status(404).end(); }

    res.status(200).json(doc);
  });
});

/* GET the analyses of a platform. */
router.get('/:cid/analyses', function(req, res, next) {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, { analyses: 1 }, function (err, doc) {
    if (err)  { return next(err); }
    if (!doc) { return res.status(404).end(); }

    res.status(200).json(doc.analyses);
  });
});

/* POST new analysis. */
router.post('/:cid/analyses', function(req, res, next) {
  if (typeof req.body !== 'object') { return res.status(400).end(); }

  req.body.id = new ObjectID();

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    { $push: { analyses: req.body } },
    { returnOriginal: false, upsert: true }, function (err, result) {

    if (err) { return next(err); }
    res.status(201).json(req.body);
  });
});

/* DELETE a platform */
router.delete('/:cid', function(req, res, next) {
  mongo.get('platforms').remove({ cardID: req.params.cid }, function (err, result) {
    if (err) { return next(err); }
    res.status(204).end();
  });
});

/* POST an existing analysis */
router.post('/:cid/analyses/:aid', function(req, res, next) {
  if (typeof req.body !== 'object') { return res.status(400).end(); }
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end(); }

  req.body.id = new ObjectID(req.params.aid);

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid, 'analyses.id': req.body.id },
    { $set: { 'analyses.$': req.body } },
    { returnOriginal: false }, function (err, result) {

    if (err) { return next(err); }
    res.status(200).json(result.value);
  });
});

/* DELETE an analysis */
router.delete('/:cid/analyses/:aid', function(req, res, next) {
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end(); }

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    { $pull: { analyses: { id: new ObjectID(req.params.aid) } } },
    { returnOriginal: false }, function (err, result) {

    if (err) { return next(err); }
    res.status(200).json(result.value);
  });
});

module.exports = router;
