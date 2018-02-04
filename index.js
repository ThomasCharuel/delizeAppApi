const express = require('express');
const app = express();
const config = require('./config');

// Dishes
app.use('/dishes', require('./src/dishes/api'));

// CurrentDishes
app.use('/currentDishes', require('./src/currentDishes/api'));

// Orders
app.use('/orders', require('./src/orders/api'));

// Cooks
app.use('/cooks', require('./src/cooks/api'));

// Users
app.use('/users', require('./src/users/api'));

// Reviews
app.use('/reviews', require('./src/reviews/api'));

// UserFollows
app.use('/userFollows', require('./src/userFollows/api'));

// CookFollows
app.use('/cookFollows', require('./src/cookFollows/api'));

// Schools
app.use('/schools', require('./src/schools/api'));

// Products
app.use('/products', require('./src/products/api'));


// Redirect root to /dishes
app.get('/', (req, res) => {
  res.redirect('/dishes');
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server
  const server = app.listen(config.PORT, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;

