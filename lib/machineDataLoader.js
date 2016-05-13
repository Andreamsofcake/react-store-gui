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

function getProductsByPlanogram(auth, grid) {
  return new Promise(function(resolve, reject) {
    SDK.productList(auth, { ids: grid , withImages: true},function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

function getCategoryById(auth, categories) {
  return new Promise(function(resolve, reject) {
    SDK.productCategoryList(auth, { ids: categories },function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

export function retrieveUpdate(machine) {
  getMachine(auth, machine.manufacturer_id).then(function(res) {
    console.log("Machine!", res);
    getPlanogramByMachine(auth, res[0]._id).then(function(res) {
      console.log("Planogram by Machine!", res.data.item.product_grid);
      var grid = [];
      res.data.item.product_grid.forEach(function(prd){
        grid.push(prd.product);
      });
      console.log(grid);
        getProductsByPlanogram(auth, grid).then(function(res) {
          console.log("products in planogram!", res.data.items);
          res.data.items.forEach(function(prd){
            if (prd.categories.length) {
              getCategoryById(auth, prd.categories).then(function(res){
                console.log("categories of products!", res.data.items);
              })
              .catch (function(error) {
                console.error("Failed to get categories!", error);
              });
            }
          })
        })
        .catch (function(error) {
          console.error("Failed to get products!", error);
        });
    })
    .catch (function(error) {
      console.error("Failed to get planogram!", error);
    });
  })
  .catch (function(error) {
    console.error("Failed to get machine!", machine.manufacturer_id);
  });
}
