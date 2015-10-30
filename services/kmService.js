var km = require('../models/km.js');
var helper = require('./helper/helperService.js');
var configBd;

var _kmService = {
    
    getKm : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;       
        req.query.getone ? km.getOne(params, configBd, onGet) : km.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    addKm : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidKm(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };
         
        configBd = req.User;
        km.create(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateKm : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidKm(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        km.update(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": obj }, res);
            return;
        }
    },

    deleteKm : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        km.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

};

module.exports = _kmService;