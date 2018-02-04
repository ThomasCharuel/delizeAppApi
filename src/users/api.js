const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /users
 *
 * Retrieve users
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
 * POST /users
 *
 * Create a new user.
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
 * GET /users/:id
 *
 * Retrieve an user.
 */
router.get('/:user', (req, res, next) => {
  model.read(req.params.user, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});



/**
 * Errors on "/users/*" routes.
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