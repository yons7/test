var spending = require('../models/spending.js');
var helper = require('./helper/HelperService.js');
var configBd;

var _spendingService = {
    
    getSpending : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        req.query.getone ? spending.getOne(params, configBd, onGet) : spending.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    addSpending : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidSpending(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        spending.create(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateSpending : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidSpending(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        spending.update(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": obj }, res);
            return;
        }
    },

    deleteSpending : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        spending.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

};

module.exports = _spendingService;