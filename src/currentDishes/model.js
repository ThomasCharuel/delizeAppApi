const Datastore = require('@google-cloud/datastore');
const config = require('../../config');

// [START config]
const ds = Datastore({
  projectId: config.GCLOUD_PROJECT
});
const kind = 'CurrentDishes';
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

// Lists all dishes in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, dishes, nextPageToken)``.
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

function listForDish(dishId, cb) {
  const q = ds.createQuery([kind])
    .filter('dishId', '=', dishId);

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err);
      return;
    }

    let currentDishes = entities.map(fromDatastore);

    cb(null, currentDishes);
  });
}

// Creates a new dish or updates an existing dish with new data. The provided
// data is automatically translated into Datastore format. The dish will be
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
  listForDish
};
// [END exports]