const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /currentDishes
 *
 * Retrieve currentDishes
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
 * GET /currentDishes/dish/:dishId
 *
 * Retrieve selling information for a dish
 */
router.get('/dish/:dishId', (req, res, next) => {
  model.listForDish(Number(req.params.dishId), (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});


/**
 * POST /dishes
 *
 * Create a new dish.
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
 * GET /dishes/:id
 *
 * Retrieve a dish.
 */
router.get('/:dish', (req, res, next) => {
  model.read(req.params.dish, (err, entity) => {
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