function mongooseDAO(modelName) {
      
    // Bring Mongoose into the app 
    var db = require('./db.js');
    
    function getAll(params, configBd,cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].find(params).exec(onFound);
            function onFound(err, result) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, result);
            }
        }
    }

    function getOne(params, configBd, cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].findOne(params).exec(onFound);
            function onFound(err, data) {
                //db.closeBD();
                if (err)
                    return cb('Internal Server Error : ' + err, null);

                return cb(null, data);
            }
        }
    }

    function create(newObj, configBd, cb) {   
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            var newobj = new connection.models[modelName](newObj);
            newobj.save(onSave);
            function onSave(err, data) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, data);
            }
        }
    }

    function remove(params, configBd, cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            if (params.idList.length === 1) // dealing with single removal here (TRIGGERS middleware Hooks)
                connection.models[modelName].findById(params.idList[0]).exec(onFound);
            else
                connection.models[modelName].remove({ _id: { $in: params.idList } }, onRemove);
            
            function onFound(err, doc) {
                if (err)
                    return cb(err, null);

                doc.remove(onRemove);
            }
             
            function onRemove(err, data) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, data);
            }            
        }
    }
    
    
    function update(obj, configBd, cb) {
        db.openBD(configBd, onDBOpen);
        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].update({ _id: obj._id }, obj, { multi: true }).exec(onUpdate);
            
            function onUpdate(err, data) {
                //db.closeBD();
                if (err)
                    return cb(err, null);
                
                return cb(null, data);
            }
        }
    }
    

    return {
        db : function () { return db },
        getAll : getAll,
        getOne : getOne,
        create : create,
        remove : remove,
        update : update
    }
}

module.exports = mongooseDAO;