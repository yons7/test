var vehicle = require('../models/vehicle.js');
var helper = require('./helper/helperService.js');
var configBd;

var _vehicleService = {
    
    getVehicle : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        req.query.getone ? vehicle.getOne(params, configBd, onGet) : vehicle.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    addVehicle : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidVehicle(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };
        
        configBd = req.User;
        vehicle.create(obj, configBd, onCreate);
        function onCreate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateVehicle : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidVehicle(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        vehicle.update(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": obj }, res);
            return;
        }
    },

    deleteVehicle : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        vehicle.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    }

};

module.exports = _vehicleService;