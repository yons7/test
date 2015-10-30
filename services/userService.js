var user = require('../models/user.js');
var mailService = require('./helper/mailService.js');
var helper = require('./helper/helperService.js');
var configBd;

var _userService = {
   
    getUser : function (req, res) {
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        req.query.getone ? user.getOne(params, configBd, onGet) : user.getAll(params, configBd, onGet);
        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;   
        }
    },
    addUser : function (req, res) {
        var newuser = req.body;
        if (!helper.validation.isValidUser(newuser)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the user fields is empty" }, res);
            return;
        };

        user.create(newuser, configBd, onCreate);
        function onCreate(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": err.code == 11000 ? 'Un utilisateur avec cet email "' + err.toJSON().op.email + '" existe déjà"' : err.message }, res);
            else{
                mailService.sendMail(newuser); //send mail to newuser; 
                helper.sendResponse(200, { "message": result }, res);
            }
            return;
        }

    },

    deleteUser : function (req, res) {
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        user.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateUser : function (req, res) {
        var updatedUser = req.body;

        if (!helper.validation.isValidUser(updatedUser)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the user fields is empty" }, res);
            return;
        };

        user.update(updatedUser, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }        
    },

};

module.exports = _userService;