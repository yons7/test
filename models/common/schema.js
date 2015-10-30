// Bring Mongoose into the app 
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var async = require('async');

try {
        
    //------------------------------------USER SCHEMA-------------------------------------------------------
        
    var userSchema = new mongoose.Schema({
        email          : { type: String, required: true, unique: true },
        password       : { type: String, required: true, select: false },
        role           : { type: Number, required: true },
        firstname      : { type: String, required: true },
        lastname       : { type: String, required: true },
        created     : Date,
        updated     : Date
    });
        
    // on every save, add the date
    userSchema.pre('save', function (next) {
        var user = this;
        handleDates(user); // on every save, add the date
            
        //hash password using bcryptjs
        if (this.isModified('password')) {
            bcrypt.genSalt(global.config.SALT_WORK_FACTOR, onGenSalt);
                
            function onGenSalt(err, salt) {
                if (err) return next(err);
                bcrypt.hash(user.password, salt, onHash);
                    
                function onHash(err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                }
            }
        }
    });
        
    userSchema.methods.comparePassword = function (candidatePassword, cb) {
        //case 1: we are comparing two hashed passwords or two clear passwords, eg: pwd stored in token vs pwd stored in db.
        if (candidatePassword == this.password)
            return cb(null, true);
        //case 2: we are comparing a password with its hash, eg: pwd entered by user (not hashed yet) and db pwd (hashed)
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };
        
    //----------------------------------BAREMES KMS SCHEMA---------------------------------------------------------
        
    var scaleSchema = new mongoose.Schema({
        type          : { type: String, required: true },
        year          : { type: Number, required: true } ,
        cv            : { type: String, required: true },
        interval      : {
            t1    : {
                from        : { type: Number, required: true },
                to          : { type: Number, required: true },
                rate        : { type: Number, required: true },
                constant    : { type: Number, required: true }
            },
            t2    : {
                from        : { type: Number, required: true },
                to          : { type: Number, required: true },
                rate        : { type: Number, required: true },
                constant    : { type: Number, required: true }
            },
            t3    : {
                from        : { type: Number, required: true },
                to          : { type: Number, required: true },
                rate        : { type: Number, required: true },
                constant    : { type: Number, required: true }
            }
        }
    });
        
    scaleSchema.index({ type: 1, year: 1, cv: 1 }, { unique: true });
        
         
    //---------------------GITES SCHEMA---------------------------------------------------------------------
        
    var giteSchema = new mongoose.Schema({
        name        : { type: String, required: true },
        address     : { type: String, required: true },
        city        : { type: String, required: true },
        country     : { type: String, required: true },
        description : { type: String },
        created     : Date,
        updated     : Date
    });
        
    giteSchema.pre('save', function (next) {
        var gite = this;
        handleDates(gite); // on every save, add the date    
        next();
    });
    giteSchema.pre('remove', function (next) {
        var gite = this;
        // enforce referential integrity
        async.parallel([
            function (cb) {
                models.Kms.findOne({ gite: gite._id }).exec(cb);
            },    
            function (cb) {
                models.Recipes.findOne({ gite: gite._id }).exec(cb);
            },
            function (cb) {
                models.Spendings.findOne({ gite: gite._id }).exec(cb);
            }
        ], onFound);

        function onFound(err, result) {
            if (err)
                return next(err);            

            result.forEach(function (doc) {
                if (doc)
                    return next(new Error("Suppression impossible car ce gite est associé à des frais kms, recette ou dépense."));
            });
            
            next();
        }
    });
        
    //---------------------Relevé banquaire SCHEMA---------------------------------------------------------------------
        
    var bankStatementSchema = new mongoose.Schema({
        date            : { year: { type: Number, required: true }, month : { type: Number, required: true } },
        startbalance    : { type: String, required: true },
        endbalance      : { type: String, required: true },
        transactions    : [{
                            title           : { type: String, required: true },
                            amount          : { type: Number, required: true },
                            type            : { type: String, required: true },
                            affectation     : { type: mongoose.Schema.ObjectId }
                            }],
        status          : { type: Number, default: 0 },
        created         : Date,
        updated         : Date
    }, { autoIndex: false });
        
    bankStatementSchema.pre('save', function (next) {
        var bankStatement = this;
        handleDates(bankStatement); // on every save, add the date    
        next();
    });

    bankStatementSchema.index({ date: 1 }, { unique: true });
        
    ////---------------------Transactions (opérations d'un relevé bancaire) SCHEMA---------------------------------------------------------------------
        
    //var transactionSchema = new mongoose.Schema({
    //    title           : { type: String, required: true },
    //    amount          : { type: Number, required: true },
    //    type            : { type: String, required: true },
    //    affectation     : { type:mongoose.Schema.ObjectId },            
    //    created         : Date,
    //    updated         : Date
    //});
        
    //transactionSchema.pre('save', function (next) {
    //    var transaction = this;
    //    handleDates(transaction); // on every save, add the date    
    //    next();
    //});
        
    //transactionSchema.methods.affect = function (justificationObject, cb) {
    //    this.affectation = justificationObject._id;
    //};
        
    //------------------------------------SPENDING SCHEMA-------------------------------------------------------

    var spendingSchema = new mongoose.Schema({
        num_justification: { type: String, required: true },
        date             : {
                                year: { type: Number, required: true },
                                month: { type: Number, required: true }
                            },
        date_operation   : { type: Date, required: true },
        modePayment         : { type: Number , required: true },
        spend            : { type: Number , required: true },
        gite             : { type: mongoose.Schema.ObjectId, ref: 'accomodations' , required: true },
        amount           : { type: Number , required: true },
        description      : {
                                provider_name: { type: String },
                                description: { type: String },
                                nature: { type: String }
                            },
        information      : {
                                tenant_name: { type: String },
                                rental_time: { type: Number },
                                reason_rembourssement: { type: String }
                            }
    });

    spendingSchema.index({ num_justification: 1, date: 1 }, { unique: true });
        
    //------------------------------------RECIPE SCHEMA-------------------------------------------------------
        
    var recipeSchema = new mongoose.Schema({
        num_justification: { type: String, required: true },
        date             : {
            year: { type: Number, required: true },
            month: { type: Number, required: true }
        },
        date_operation   : { type: Date, required: true },
        modePayment      : { type: Number , required: true },
        recipe           : { type: Number , required: true },
        gite             : { type: mongoose.Schema.ObjectId, ref: 'accomodations' , required: true },
        amount           : { type: Number , required: true },
        description1     : {
            libelle         : { type: String },
            information     : { type: String }
        },
        description2      : {
            tenant_name     : { type: String },
            rental_time     : { type: Number },
            libelle         : { type: String }
        },
        description3      : {
            star_date       : { type: Date },
            rental_time     : { type: Number }
        }
    });
        
    recipeSchema.index({ num_justification: 1, date: 1 }, { unique: true });
      
    //------------------------------------VEHICLE SCHEMA-------------------------------------------------------
        
    var vehicleSchema = new mongoose.Schema({
        immatriculation  : { type: String, required: true , unique: true },
        marque           : { type: String },
        modele           : { type: String },
        cv               : { type: String , required: true },
        type             : { type: String , required: true },
        created          : Date,
        updated          : Date
    });
        
    vehicleSchema.pre('save', function (next) {
        var vehicule = this;
        handleDates(vehicule); // on every save, add the date    
        next();
    });
    vehicleSchema.pre('remove', function (next) {
        // enforce referential integrity
        models.Kms.findOne({ vehicle: this._id }).exec(onFound)    ;
        function onFound(err, doc) {
            if (err)
                return next(err);
        
            if (doc)
                return next(new Error("Suppression impossible car des frais kilometriques sont associés à ce véhicule"));
            else
                next();
        }        
    });
        
    //------------------------------------KM SCHEMA-------------------------------------------------------
        
    var kmSchema = new mongoose.Schema({
        num_justification   : { type: String, required: true },
        date                : {
            year: { type: Number, required: true },
            month: { type: Number, required: true }
        },
        modePayment            : { type: Number , required: true },
        gite                : { type: mongoose.Schema.ObjectId, ref: 'accomodations' , required: true },
        vehicle             : { type: mongoose.Schema.ObjectId, ref: 'vehicles' , required: true },
        date_travel         : { type: Date, required: true },
        km                  : { type: Number , required: true },
        start_place         : { type: String , required: true },          
        finish_place        : { type: String , required: true },
        motif               : { type: String }
    });
        
    kmSchema.index({ num_justification: 1, date: 1 }, { unique: true });
           
    function handleDates(dbObject) { 
        var currentDate = new Date();
        dbObject.updated = currentDate;
        // if created doesn't exist, add to that field
        if (!dbObject.created)
            dbObject.created = currentDate;
    }
        
}
catch (err) {
    console.log('error while loading schema, all your databases are NOT working!!' + err);
    throw err;
}


module.exports = function (connection) {
    try {

        if (connection.name === config.parametreBd.nameBd){
            return models = {
                Users           : connection.model('users', userSchema),
                Scales          : connection.model('scales', scaleSchema)                               
            };
        } else {
            return models = {
                Accomodations   : connection.model('accomodations', giteSchema),
                Spendings       : connection.model('spendings', spendingSchema),            
                BankStatements  : connection.model('bankStatements', bankStatementSchema),
                Recipes         : connection.model('recipes', recipeSchema),
                Vehicles        : connection.model('vehicles', vehicleSchema),
                Kms             : connection.model('kms', kmSchema)
        };
        }
    }
    catch (err) {
        console.log('error while loading models, all your databases are NOT working!!' + err);
        return err;
    }
}