const Datastore = require('@google-cloud/datastore');
const config = require('../../config');

const userFollowsModel = require('../userFollows/model');
const cookFollowsModel = require('../cookFollows/model');
const ordersModel = require('../orders/model');

// [START config]
const ds = Datastore({
  projectId: config.GCLOUD_PROJECT
});
const kind = 'User';
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

// Lists all users in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, users, nextPageToken)``.
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

// Creates a new user or updates an existing user with new data. The provided
// data is automatically translated into Datastore format. The user will be
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
    data: toDatastore(data, ['imageUrl'])
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

    let user = fromDatastore(entity);

    // Get follows for an user
    userFollowsModel.listForUser(Number(user.id), (err, entities) => {
      if (err) {
        next(err);
        return;
      }
      user.follows = entities;

      // Get cookFollows for an user
      cookFollowsModel.listForUser(Number(user.id), (err, entities) => {
        if (err) {
          next(err);
          return;
        }
        user.cookFollows = entities;
        
        // Get orders for an user
        ordersModel.listForUser(Number(user.id), (err, entities) => {
          if (err) {
            next(err);
            return;
          }
          user.orders = entities;
          
          cb(null, user);
        });
      });
    });
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
  list
};
// [END exports]