var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function Vehicle() {
    
    var vehicle = {};
    
    var modelName = "vehicles";
    vehicle.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "vehicles" model.
    db = vehicle.db();
    
    return vehicle;
}

module.exports = Vehicle();