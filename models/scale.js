var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function Scale() {
    
    var scale = {};

    var modelName = "scales";
    scale.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "scales" model.
    db = scale.db();
    
    return scale;
}

module.exports = Scale();