var mongooseDAO = require("./common/mongooseDAO.js");
var db;
var model;

function Accomodation() {
    
    var accomodation = {};

    var modelName = "accomodations";
    accomodation.__proto__ = mongooseDAO(modelName);      //inherits mongooseDAO class and connects to "accomodations" model.
    db = accomodation.db();

    return accomodation;
}

module.exports = Accomodation();