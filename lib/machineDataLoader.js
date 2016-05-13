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
    SDK.machineList(auth,{ filter: { manufacturer_id: id }}, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res.data.items);
     })
  });
}

function getPlanogramByMachine(auth, id) {
  return new Promise(function(resolve, reject) {

    SDK.machinePlanogramGetByMachineId(auth, { id: id }, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

function getProductById(auth, id) {
  return new Promise(function(resolve, reject) {
    SDK.productList(auth, { filter:  { _id: id }}, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

getMachine(auth, machine.manufacturer_id).then(function(res) {
  console.log("Machine!", res);
  getPlanogramByMachine(auth, res[0]._id).then(function(res) {
    console.log("Planogram by Machine!", res.data.item.product_grid);
    var grid = res.data.item.product_grid;
    grid.forEach(function(prd){
      console.log(prd.product);
      getProductById(auth, prd.product).then(function(res) {
        console.log("products in planogram!", res);
      })
      .catch (function(error) {
        console.error("Failed to get products!", error);
      });
    })

  })
  .catch (function(error) {
    console.error("Failed to get planogram!", error);
  });
})
.catch (function(error) {
  console.error("Failed to get machine!", machine.manufacturer_id);
});


getProductById(auth, '573650709060728e3c92d0a9').then(function(res) {
  console.log("product by id!", res);
})
.catch (function(error) {
  console.error("Failed to get products", error);
});

// getPlanogramByMachine(auth, '573503bcb1b404182967db3e').then(function(res) {
//   console.log("Planogram by Machine!", res.data.item.product_grid);
// })
// .catch (function(error) {
//   console.error("Failed to get planogram!", error);
// });

// function getPlanogramByClient(auth, id) {
//   return new Promise(function(resolve, reject) {
//     SDK.machinePlanogramGetByClient(auth, { client: id }, function(error, res){
//       if(error) {
//         return reject(error)
//       }
//       resolve(res);
//      })
//   });
// }
//
// getPlanogramByClient(auth, '56ea5f8019b90d263b8c5e2d').then(function(res) {
//   console.log("Planogram by Client!", res.data.items[0]);
// })
// .catch (function(error) {
//   console.error("Failed to get planogram!", error);
// });
