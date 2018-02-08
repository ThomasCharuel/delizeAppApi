const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');
const currentDishesModel = require('../currentDishes/model');

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

  let order = req.body;

  // Find the current dish using dishId
  currentDishesModel.listForDish(order.dishId, (err, entities) => {
    if (err) {
      next(err);
      return;
    }

    let currentDish = entities[0];

    currentDish.availablePortions -= order.nbPortions;

    // Check if there is enough portions for the order
    if(currentDish.availablePortions < 0){
      err = {
        code: 409,
        message: 'Il n\'y a plus assez de portions disponibles pour ce plat'
      }
      next(err);
    }

    // Update the number of available portions
    currentDishesModel.update(currentDish.id, currentDish, (err, entity) => {
      if (err) {
        next(err);
        return;
      }

      // Create the order
      model.create(req.body, (err, entity) => {
        if (err) {
          next(err);
          return;
        }

        res.json(entity);
      });
    })
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