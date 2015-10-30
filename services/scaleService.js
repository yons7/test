var scale = require('../models/scale.js');
var helper = require('./helper/helperService.js');
var configBd;

var _scaleService = {
      
    getScale : function (req, res) {
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        req.query.getone ? scale.getOne(params, configBd, onGet) : scale.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    addScale : function (req, res) {
        var newscale = req.body;
        
        if (!helper.validation.isValidScale(newscale)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        scale.create(newscale, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateScale : function (req, res) {
        var updatedScale = req.body;
        
        if (!helper.validation.isValidScale(updatedScale)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        scale.update(updatedScale, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": updatedScale }, res);
            return;
        }
    },

};

module.exports = _scaleService;