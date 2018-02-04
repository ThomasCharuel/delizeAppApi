const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /reviews
 *
 * Retrieve reviews
 */
router.get('/', (req, res, next) => {
  model.list((err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json( entities );
  });
});


/**
 * POST /reviews
 *
 * Create a new review.
 */
router.post('/', (req, res, next) => {
  model.create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * GET /reviews/:id
 *
 * Retrieve an review.
 */
router.get('/:review', (req, res, next) => {
  model.read(req.params.review, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});



/**
 * Errors on "/reviews/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = router;