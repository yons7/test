var mongooseDAO = require("./common/mongooseDAO.js");
var db;
var model;

function BankStatement() {
    
    var bankStatement = {};

    var modelName = "bankStatements";
    bankStatement.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "bankStatements" model.
    db = bankStatement.db();
   


    return bankStatement;
}

module.exports = BankStatement();