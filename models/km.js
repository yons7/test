var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function Km() {
    
    var km = {};
    
    var modelName = "kms";
    km.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "kms" model.
    db = km.db();
    
    km.getAll = function (params, configBd, cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].find(params).populate('gite').populate('vehicle').exec(onFound);
            function onFound(err, result) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, result);
            }
        }
    } 
    
    return km;
}

module.exports = Km();