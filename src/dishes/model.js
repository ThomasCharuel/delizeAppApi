const Datastore = require('@google-cloud/datastore');
const config = require('../../config');

// [START config]
const ds = Datastore({
  projectId: config['GCLOUD_PROJECT']
});
const kind = 'Dish';
// [END config]