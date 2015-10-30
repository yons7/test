var mongooseDAO = require("./common/mongooseDAO.js");
var configBd, db, model;

function User() { 

    var user = {};
    
    var modelName = "users";
    user.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "users" model.
    db = user.db();

    user.validateUser = function (email, password, cb) {
        db.openBD(configBd, onDBOpen);

        function onDBOpen(err, connection) {
            if (err)
                return cb(err, null);
            
            connection.models[modelName].findOne({ 'email': email }).select("+password").exec(onFound);
            function onFound(err, user) {
                if (err)
                    return cb('Internal Server Error : ' + err, null);
                
                if (user == null)
                    return cb('Compte n\'existe pas', null);
                
                // verify password against its hash in db
                user.comparePassword(password, function (err, isMatch) {
                    //if (err) throw err;
                    if (isMatch)
                        return cb(null, user);
                    else return cb(null, undefined);
                });
            }
        }
    } 

    return user;
}

module.exports = User();