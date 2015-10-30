var bankStatement = require('../models/bankStatement.js');
var helper = require('./helper/helperService.js');
var configBd;

var _bankStatementService = {
    
    addBankStatement : function (req, res) {
        var newbankstatement = req.body;
        
        if (!helper.validation.isValidBankStatement(newbankstatement)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
                
        bankStatement.create(newbankstatement, configBd, onCreate);
        function onCreate(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    deleteBankStatement : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        bankStatement.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    getBankStatement : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;

        req.query.getone ? bankStatement.getOne(params, configBd, onGet) : bankStatement.getAll(params, configBd, onGet);

        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    updateBankStatement : function (req, res) {
        var updatedBankStatement = req.body;
        configBd = req.User;

        if (!helper.validation.isValidBankStatement(updatedBankStatement)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        bankStatement.update(updatedBankStatement, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": updatedBankStatement }, res);
            return;
        }
    },

};

module.exports = _bankStatementService;