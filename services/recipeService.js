var recipe = require('../models/recipe.js');
var helper = require('./helper/HelperService.js');
var configBd;

var _recipeService = {
    
    getRecipe : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;        
        req.query.getone ? recipe.getOne(params, configBd, onGet) : recipe.getAll(params, configBd, onGet);

        function onGet(err, result) {
            if (err)
                helper.sendResponse(500, { "errormessage": "Erreur interne au niveau de la base de données" }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },
    
    addRecipe : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidRecipe(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        recipe.create(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

    updateRecipe : function (req, res) {
        var obj = req.body;
        
        if (!helper.validation.isValidRecipe(obj)) {
            helper.sendResponse(401, { "errormessage": "Invalid credentials or one the fields is empty" }, res);
            return;
        };

        configBd = req.User;
        recipe.update(obj, configBd, onUpdate);
        function onUpdate(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": obj }, res);
            return;
        }
    },

    deleteRecipe : function (req, res) {
        configBd = req.User;
        var params = req.query.params !== undefined ? JSON.parse(req.query.params) : null;
        recipe.remove(params, configBd, onDelete);
        function onDelete(err, result) {
            if (err)
                helper.sendResponse(401, { "errormessage": err.message }, res);
            else
                helper.sendResponse(200, { "message": result }, res);
            return;
        }
    },

};

module.exports = _recipeService;