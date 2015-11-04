
// Bring Mongoose into the app 
var mongoose = require('mongoose');
var connection;


listnerCurrentConnection = function (connection) {
    connection.on('open', function (ref) {
        console.log('open connection to mongo server User : { nameBd : ' + connection.name + ', state : ' + connection.readyState + '}');
    });
    
    connection.on('connected', function (ref) {
        console.log('connected to mongo server : { nameBd : ' + connection.name + ', state : ' + connection.readyState + '}');
    });
    
    connection.on('disconnected', function (ref) {
        console.log('disconnected from mongo server : { nameBd :' + connection.name + ', state : ' + connection.readyState + '}');
    });
    
    connection.on('close', function (ref) {
        console.log('close connection to mongo server : { nameBd :' + connection.name + ', state : ' + connection.readyState + '}');
    });
    
    connection.on('error', function (err) {
        console.log(err + ' { nameBd : ' + connection.name + ', state : ' + connection.readyState + '}');
    });
    
    connection.on('reconnect', function (ref) {
        console.log('reconnect to mongo server : { nameBd : ' + connection.name + ', state : ' + connection.readyState + '}');
    });

}


try {
    // Create the Default database connection     
    mongoose.connect(config.dbURI + config.parametreBd.nameBd, {});
    var registerDBSchema = require('./schema.js')(mongoose.connection);
    listnerCurrentConnection(mongoose.connection);
} 
catch (err) {
    console.log('Internal Server mongo DB Error : ' + err);
    throw err;
}

getCurrentUserConnection = function (id, cb){
    var con = undefined;
     mongoose.connections.forEach(function (element) {
        if (element.name === id)
            con = element;
    });
    return cb(null, con);
}

module.exports = {
    
    openBD : function (user, cb) {
        if (user !== undefined) {
            getCurrentUserConnection('user_' + user._id, function (err, con) { 
                if (err) {
                    return cb('Internal Server mongo DB Error : ' + err);
                }
                if (con === undefined) {
                    // Create the database connection 
                    connection = mongoose.createConnection(config.dbURI_user + 'user_' + user._id, {}, function (err) {
                        if (err) {
                            return cb('Internal Server mongo DB Error : ' + err);
                        }
                    });
                    registerDBSchema = require('./schema.js')(connection);
                    listnerCurrentConnection(connection);
                } else {
                    connection = con;
                }     
            });
           
            return cb(null, connection);                  
        } else {
            if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
                // Create the database connection 
                mongoose.connect(config.dbURI + config.parametreBd.nameBd, {}, function (err) {
                    if (err) {
                        return cb('Internal Server mongo DB Error : ' + err);
                    }
                });
                registerDBSchema = require('./schema.js')(mongoose.connection);
            }
            return cb(null, mongoose.connection);
        }        
    }
    
    //closeBD : function () {
    //    if (connection !== undefined && connection.name !== config.parametreBd.nameBd && (connection.readyState === 1 || connection.readyState === 2)) {
    //        connection.close();
    //    } 
    //}
};



// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
    connection.close(function () {
        mongoose.connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        })
    });
});