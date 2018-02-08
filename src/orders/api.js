const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /orders
 *
 * Retrieve orders
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
 * POST /orders
 *
 * Create a new order.
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
 * GET /orders/:id
 *
 * Retrieve an order.
 */
router.get('/:order', (req, res, next) => {
  model.read(req.params.order, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * GET /orders/user/:userId
 *
 * Retrieve orders for an user.
 */
router.get('/user/:userId', (req, res, next) => {
  model.listForUser(Number(req.params.userId), (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});

/**
 * GET /orders/dish/:dishId
 *
 * Retrieve orders for an dish.
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

router.get('/validate/:orderId', (req, res, next) => {
  model.read(req.params.orderId, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    
    // Update current value: the order is completed
    entity.current = false;

    model.update(req.params.orderId, entity, (err, entity) => {
      if (err) {
        next(err);
        return;
      }
      res.json(entity)
    })
  });
})


/**
 * Errors on "/orders/*" routes.
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