const express = require('express');
const bodyParser = require('body-parser');

const model = require('./model');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /userFollows
 *
 * Retrieve userFollows
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
 * POST /userFollows
 *
 * Create a new userFollow.
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
 * GET /userFollows/:id
 *
 * Retrieve an userFollow.
 */
router.get('/:userFollow', (req, res, next) => {
  model.read(req.params.userFollow, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});


/**
 * GET /userFollows/user/:userId
 *
 * Retrieve userFollows for an user.
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
 * GET /userFollows/recipient/:userId
 *
 * Retrieve userFollows for an recipient user. (retrieve the followers)
 */
router.get('/recipientUser/:userId', (req, res, next) => {
  model.listForRecipientUser(Number(req.params.userId), (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});

/**
 * DELETE /userFollows/:id
 *
 * Delete a userFollow
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
 * Errors on "/userFollows/*" routes.
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