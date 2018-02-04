const Datastore = require('@google-cloud/datastore');
const config = require('../../config');

const dishesModel = require('../dishes/model');
const reviewsModel = require('../reviews/model');


// [START config]
const ds = Datastore({
  projectId: config.GCLOUD_PROJECT
});
const kind = 'Order';
// [END config]

// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
function fromDatastore (obj) {
  obj.id = obj[Datastore.KEY].id;
  return obj;
}

// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
function toDatastore (obj, nonIndexed) {
  nonIndexed = nonIndexed || [];
  const results = [];
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) {
      return;
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    });
  });
  return results;
}

// Lists all orders in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, orders, nextPageToken)``.
// [START list]
function list (cb) {
  const q = ds.createQuery([kind]);

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err);
      return;
    }
  
    cb(null, entities.map(fromDatastore));
  });
}
// [END list]

function listForUser(userId, cb) {

  const q = ds.createQuery([kind])
    .filter('userId', '=', userId);

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err);
      return;
    }

    let orders = entities.map(fromDatastore);

    // Get the dishes linked to an order
    const ordersWithDish = orders.map( 
      (order, i) => new Promise( resolve => {
        dishesModel.read(order.dishId, (err, entity) => {
          if (err) {
            next(err);
            return;
          }
          orders[i].dish = entity;
          resolve();
        })
      })
    )

    // Get the revews linked to an order
    const ordersWithReview = orders.map(
      (order, i) => new Promise( resolve => {
        reviewsModel.getForOrder(Number(order.id), (err, entity) => {
          if (err) {
            next(err);
            return;
          }

          if(entity)
            orders[i].review = entity;

          resolve();
        })
      })
    ) 

    Promise.all( [...ordersWithDish, ...ordersWithReview] ).then( 
      () => cb(null, orders) 
    )
  });
}

// Creates a new order or updates an existing order with new data. The provided
// data is automatically translated into Datastore format. The order will be
// queued for background processing.
// [START update]
function update (id, data, cb) {
  let key;
  if (id) {
    key = ds.key([kind, parseInt(id, 10)]);
  } else {
    key = ds.key(kind);
  }

  const entity = {
    key: key,
    data: toDatastore(data, [])
  };

  ds.save(
    entity,
    (err) => {
      data.id = entity.key.id;
      cb(err, err ? null : data);
    }
  );
}
// [END update]

function create (data, cb) {
  update(null, data, cb);
}

function read (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.get(key, (err, entity) => {
    if (!err && !entity) {
      err = {
        code: 404,
        message: 'Not found'
      };
    }
    if (err) {
      cb(err);
      return;
    }
    cb(null, fromDatastore(entity));
  });
}

function _delete (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.delete(key, cb);
}

// [START exports]
module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list,
  listForUser
};
// [END exports]