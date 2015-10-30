var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function Recipe() {
    
    var recipe = {};

    var modelName = "recipes";
    recipe.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "spendings" model.
    db = recipe.db();
    
    recipe.getAll = function (params, configBd, cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].find(params).populate('gite').exec(onFound);
            function onFound(err, result) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, result);
            }
        }
    } 
    
    return recipe;
}

module.exports = Recipe();