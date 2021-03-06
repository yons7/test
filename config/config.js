﻿var config = {};

config.auth = {};
config.auth.secret = '1J=>YuH1>oqOf)pKt0JlcWT6l`=P}:<zT7RpK;~J!yjhF;JvTDy;c:{R4MW|*~`[';    //This is a secret generated by https://api.wordpress.org/secret-key/1.1/salt/
config.auth.tokenExpiration = 7; //days

config.session = {};
config.session.secret = '4q)o?(&p7!qija_EK3=^|kPbx|YA}P`ew&lJUM$d!fp}-?]>r:j2w&+v-qM$+5go';    //This is a secret generated by https://api.wordpress.org/secret-key/1.1/salt/
config.session.resave = true;
config.session.saveUninitialized = true;

config.SALT_WORK_FACTOR = 10;                   //default value used by bcrypt for hashing

config.web = {};
config.web.port = process.env.WEB_PORT || 1337;


//this part is shared with client-side JS via get/
config.client = {};
config.client.port = config.web.port;
config.client.apiUrl = '/api/v1/';
config.client.userApiUrl = config.client.apiUrl + 'admin/users';
config.client.scalesApiUrl = config.client.apiUrl + 'admin/scales';
config.client.accomodationApiUrl = config.client.apiUrl + 'accomodation';
config.client.spendingApiUrl = config.client.apiUrl + 'spending';
config.client.recipeApiUrl = config.client.apiUrl + 'recipe';
config.client.vehicleApiUrl = config.client.apiUrl + 'vehicle';
config.client.kmApiUrl = config.client.apiUrl + 'km';
config.client.bankStatementApiUrl = config.client.apiUrl + 'bankstatement';

//All application routes with access restrictions
config.client.routes = {};
config.client.routes.login =            { RouteUrl : '/login', 		                templateUrl : 'partials/login.html', 		    controller : 'LoginCtrl',           access: { requiredLogin: false, requiredAdmin: false } };
config.client.routes.home =             { RouteUrl : '/', 				            templateUrl : 'partials/home.html', 		    controller : 'HomeCtrl',            access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.subscription =     { RouteUrl : '/inscription', 	            templateUrl : 'partials/subscription.html',     controller : 'SubscriptionCtrl',    access: { requiredLogin: true,  requiredAdmin: true } };
config.client.routes.accomodation =     { RouteUrl : '/gites',                      templateUrl : 'partials/accomodation.html',     controller : 'AccomodationCtrl',    access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.scales =           { RouteUrl : '/baremesKms',                 templateUrl : 'partials/scales.html',           controller : 'ScalesCtrl',          access: { requiredLogin: true,  requiredAdmin: true } };
config.client.routes.bankStatement =    { RouteUrl : '/relevebancaire',             templateUrl : 'partials/bankStatement.html',    controller : 'BankStatementCtrl',   access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.spending =         { RouteUrl : '/depenses',                   templateUrl : 'partials/spending.html',         controller : 'SpendingCtrl',        access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.recipe =           { RouteUrl : '/recettes',                   templateUrl : 'partials/recipe.html',           controller : 'RecipeCtrl',          access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.vehicle =          { RouteUrl : '/vehicules',                  templateUrl : 'partials/vehicle.html',          controller : 'VehicleCtrl',         access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.km =               { RouteUrl : '/kms',                        templateUrl : 'partials/km.html',               controller : 'KmCtrl',              access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.mapping =          { RouteUrl : '/rapprochement',              templateUrl : 'partials/mapping.html',          controller : 'MappingCtrl',         access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.recipesTable =     { RouteUrl : '/tableauRecettes',            templateUrl : 'partials/recipesTable.html',     controller : 'DashboardCtrl',       access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.spendingTable =    { RouteUrl : '/tableauDepenses',            templateUrl : 'partials/spendingTable.html',    controller : 'DashboardCtrl',       access: { requiredLogin: true,  requiredAdmin: false } };
config.client.routes.kmsTable =         { RouteUrl : '/tableauFraisKilometrique',   templateUrl : 'partials/kmsTable.html',         controller : 'DashboardCtrl',       access: { requiredLogin: true,  requiredAdmin: false } };

//Send Mail/
config.mail = {};
config.mail.transport = {};
config.mail.transport.protocol = 'SMTP';
config.mail.transport.param = {};
config.mail.transport.param.service = 'Gmail';
config.mail.transport.param.port = 25,
config.mail.transport.param.debug = true,
config.mail.transport.param.auth = {};
config.mail.transport.param.auth.user = 'Comptable.Easy16i@gmail.com'
config.mail.transport.param.auth.pass = 'admin/123'
config.mail.transport.param.tls = {};
config.mail.transport.param.tls.ciphers = 'SSLv3';
config.mail.transport.param.tls.rejectUnauthorized = false;
config.mail.subject = 'Générateur Mot de Passe Easy 16i';
config.mail.text = 'Bonjour, Votre mot de passe est : ';

//MongoDB
config.parametreBd = {};
config.parametreBd.host = 'localhost';
config.parametreBd.port = '27017';
config.parametreBd.nameBd = 'configuration';
config.parametreBd.email = 'Comptable.Easy16i@gmail.com';
config.parametreBd.password = 'admin/123';
config.dbURI = 'mongodb://' + config.parametreBd.host + ':' + config.parametreBd.port + '/';

config.demoVersion = true;
config.dbURI = config.demoVersion ? 'mongodb://admin:test@ds052408.mongolab.com:52408/' : config.dbURI;
config.dbURI_user = config.demoVersion ? 'mongodb://admin:test@ds048878.mongolab.com:48878/' : config.dbURI;


config.client.init = {};
config.client.init.year = 2014;


module.exports = config;