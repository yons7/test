var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function Spending() {
    
    var spending = {};
    
    var modelName = "spendings";
    spending.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "spendings" model.
    db = spending.db();
    
    spending.getAll = function (params, configBd, cb) {
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
    
    return spending;
}

module.exports = Spending();