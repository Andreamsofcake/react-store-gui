import SDK from 'sdk-core-lib'
import RQ from 'request'
import path from 'path'

var filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:' + ACTION)
	;

function getMachine({}, id) {
  return new Promise(function(resolve, reject) {
    SDK.machineGetByVendorId({}, { vendor_id: id }, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res.data.item);
     })
  });
}

function getPlanogramByMachine({}, id) {
  return new Promise(function(resolve, reject) {

    SDK.machinePlanogramGetByMachineId({}, { id: id }, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

function getProductsByPlanogram({}, list) {
  return new Promise(function(resolve, reject) {
    SDK.productList({}, { ids: list, withImages:true }, function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

function getCategories({}, categories) {
  return new Promise(function(resolve, reject) {
    SDK.productCategoryList({}, { ids: categories },function(error, res){
      if(error) {
        return reject(error)
      }
      resolve(res);
     })
  });
}

function retrieveUpdate(machineName, callback) {
  var data = {
    machine : {},
    planogram : {},
    products : [],
    categories : []
  }
  getMachine({}, machineName).then(function(res) {
    data.machine = res.length ? res[0] : res;

    getPlanogramByMachine({}, data.machine._id).then(function(res) {
      // console.log("Planogram by Machine!", res.data.item.product_grid);
      data.planogram = res.data.item;
      var productList = [];
      if (res.data.item.product_grid.length) {
        res.data.item.product_grid.forEach(function(prd){
          function checkAndAdd(name) {
              var found = productList.some(function (el) {
                return el.product === name.product;
              });
              if (!found) { productList.push(name.product); }
            }
          checkAndAdd(prd);
      });
    }
        getProductsByPlanogram({}, productList).then(function(res) {
          res.data.items.forEach(function(prd){
            data.products.push(prd);
            var categoryList = [];
            if (prd.categories.length) {
              prd.categories.forEach(function(c) {
                function checkAndAdd(name) {
                    var found = categoryList.some(function (el) {
                      return el === name;
                    });
                    if (!found) { categoryList.push(name); }
                  }
                checkAndAdd(c);
              })
              getCategories({}, categoryList).then(function(res){
                // console.log("categories of products!", res.data.items);

                res.data.items.forEach(function(category){
                  data.categories.push(category);
                });
                // console.log(data);
                callback(null, data);
              })
              .catch (function(error) {
                console.error("Failed to get categories!", error);
                callback(error)
              });
            }
          })
        })
        .catch (function(error) {
          console.error("Failed to get products!", error);
          callback(error)
        });
    })
    .catch (function(error) {
      console.error("Failed to get planogram!", error);
      callback(error)
    });
  })
  .catch (function(error) {
    console.error("Failed to get machine!", machineName);
    console.error(error);
    callback(error)
  });
}
/*
retrieveUpdate('SDK-00002', function(err, data){
  if(err) {
    console.log(err);
  }
  if(data) {
    console.log(data);
    return data
  }
})
*/
export default retrieveUpdate;
