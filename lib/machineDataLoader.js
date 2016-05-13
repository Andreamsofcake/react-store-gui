// import SDK from 'sdk-core-lib'
var SDK = require('../node_modules/sdk-core-lib');

var machine =
  { client: '56ea5f8019b90d263b8c5e2d',
   machine_public_id: '41234',
  label: 'This',
  location: '56f0a4c188123d3c44598b6a',
  enabled: true,
  type: 'avt',
  model: 'Model One',
  manufacturer_id: 'SDK-00002',
  order_date: null,
  delivery_date: null,
  planogramSlotConfiguration: null,
  planogramSet: null,
  status: 'offline',
  _id: null,
  created: { by: null },
  modified: { date: null, by: null } };

var auth = {};

function getMachine(auth, id) {
  SDK.machineList(auth, { manufacturer_id: id }, function(error, res){
    console.log(res)
    console.log(error)
  });
};

console.log(machine.manufacturer_id);
console.log(machine.client);
getMachine(auth, machine.manufacturer_id);
