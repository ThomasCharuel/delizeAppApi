const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /dishes
 *
 * Retrieve dishes
 */
router.get('/', (req, res, next) => {
  res.json({
    hello: 'hello'
  })
});


/**
 * POST /dishes
 *
 * Create a new dish.
 */
router.post('/', (req, res, next) => {
  getModel().create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});


/**
 * Errors on "/dishes/*" routes.
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