const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /cookFollows
 *
 * Retrieve cookFollows
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
 * POST /cookFollows
 *
 * Create a new cookFollow.
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
 * GET /cookFollows/:id
 *
 * Retrieve an cookFollow.
 */
router.get('/:cookFollow', (req, res, next) => {
  model.read(req.params.cookFollow, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * GET /cookFollows/user/:userId
 *
 * Retrieve cookFollows for an user.
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
 * GET /cookFollows/cook/:cookId
 *
 * Retrieve follows for an cook.
 */
router.get('/cook/:cookId', (req, res, next) => {
  model.listForCook(Number(req.params.cookId), (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});


/**
 * DELETE /cookFollows/:id
 *
 * Delete a cookFollow
 */
router.delete('/:id', (req, res, next) => {
  model.delete(req.params.id, (err) => {
    if(err) {
      next(err);
      return;
    }
    res.json({
      message: 'Successfully deleted'
    })
  })
})



/**
 * Errors on "/cookFollows/*" routes.
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