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
  manufacturer_id: 'SDK-00003',
  order_date: null,
  delivery_date: null,
  planogramSlotConfiguration: null,
  planogramSet: null,
  status: 'offline',
  _id: null,
  created: { by: null },
  modified: { date: null, by: null } };

var auth = {};
// // var machineArray = [];
//
// // function getMachine(auth, id) {
// //   SDK.machineList(auth, { manufacturer_id: id }, function(error, res){
// //     return res.data.items;
// //     console.log(error);
// //   });
// // };
//
// console.log(machine.manufacturer_id);
// console.log(machine.client);
// getMachine(auth, machine.manufacturer_id);


function getMachine(auth, id) {
  return new Promise(function(resolve, reject) {
    SDK.machineList(auth, { manufacturer_id: id }, function(error, res){
      if(error) {
        reject(error)
      }
      resolve(res.data.items);
     })
  });
}

getMachine(auth, "123453").then(function(res) {
  console.log("Machine!", res);
}, function(error) {
  console.error("Failed to get machine!", error);
}).catch(function() {
    throw new Error('Could not find machine: ' + machine.manufacturer_id);
  });

// function getPlanogramByMachine(auth, id) {
//   return new Promise(function(resolve, reject) {
//
//     SDK.machinePlanogramGetByMachineId(auth, { id: id }, function(error, res){
//       if(error) {
//         reject(error)
//       }
//       resolve(res);
//      })
//   });
// }

// getPlanogramByMachine(auth, '573503bcb1b404182967db3e').then(function(res) {
//   console.log("Planogram by Machine!", res);
// }, function(error) {
//   console.error("Failed to get planogram!", error);
// }).catch(function() {
//     throw new Error('Could not find planogram by: ' + '573503bcb1b404182967db3e');
//   });
//
// function getPlanogramByClient(auth, id) {
//   return new Promise(function(resolve, reject) {
//     SDK.machinePlanogramGetByClient(auth, { client: id }, function(error, res){
//       if(error) {
//         reject(error)
//       }
//       resolve(res);
//      })
//   });
// }
//
// getPlanogramByClient(auth, '56ea5f8019b90d263b8c5e2d').then(function(res) {
//   console.log("Planogram by Client!", res.data.items[0]);
// }, function(error) {
//   console.error("Failed to get planogram!", error);
// }).catch(function() {
//     throw new Error('Could not find planogram by: ' + '56ea5f8019b90d263b8c5e2d');
//   });
