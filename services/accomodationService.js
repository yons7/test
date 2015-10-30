var accomodation = require('../models/accomodation.js');
var helper = require('./helper/helperService.js');
var configBd;

var _accomodationService = {
    
    getAccomodation : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        req.query.getone ? accomodation.getOne(params, configBd, onGet) : accomodation.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    addAccomodation : function (req, res) {
        var newaccom = req.body;
        
        if (!helper.validation.isValidAccomodation(newaccom)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;        
        accomodation.create(newaccom, configBd, onCreate);
        function onCreate(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": err.code == 11000 ? 'Un utilisateur avec cet email "' + err.toJSON().op.email + '" existe déjà"' : err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }

    },
    
    deleteAccomodation : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        accomodation.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },   
    
    updateAccomodation : function (req, res) {
        var updatedAccomodation = req.body;
        if (!helper.validation.isValidAccomodation(updatedAccomodation)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };
        configBd = req.User;
        accomodation.update(updatedAccomodation, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": updatedAccomodation }, res);
            return;
        }
    },

};

module.exports = _accomodationService;