myApp.controller("RecipeCtrl", function ($scope, ApiService, Ressources, HelperService, PersistentDataService, config) {
    $scope.name = "Recette";
    $scope.currentDate = PersistentDataService.date;
    
    $scope.changePage = function () {
        if ($scope.isEdit)
            $scope.isEdit = false
        else {
            $scope.isEdit = true;
            $scope.listRecipe();
        }
    };
    
    $scope.$on('DateChange', function (events, args) {
        $scope.currentDate = args;
        if ($scope.isEdit)
            $scope.listRecipe();

    })
    
    $scope.libelleList = {
        selectedOption: {},
        availableOptions: Ressources.libelleList
    };
    
    $scope.paymentRadio = {
        selectedOption: Ressources.modePayment[0],
        availableOptions: Ressources.modePayment
    };
    
    $scope.recipeRadio = {
        selectedOption: Ressources.typeRecipes[0],
        availableOptions: Ressources.typeRecipes
    };
    
    $scope.selecteditem = undefined;
    
    ApiService.Accomodation.get(function (res) {
        $scope.accomodationList = res.message;
    }, function (err) {
        console.log(err);
    });
    
    $scope.selectedGite = undefined;
    
    $scope.listRecipe = function () {
        if ($scope.isEdit) {
            ApiService.Recipe.get({ params: { 'date.year' : $scope.currentDate.year , 'date.month' : $scope.currentDate.month } }, function (res) {
                $scope.recipeList = res.message;
                $scope.reset();
                $scope.itemsByPage = 10;
            }, function (err) {
                console.log(err);
            });
        }
    }
    
    $scope.reset = function () {
        this.recipeCreationForm.reset();
        $scope.selecteditem = undefined;
    }
    
    $scope.displayedRecipeList = [].concat($scope.recipeList);
    $scope.itemsByPage = 10;
    
    $scope.createUpdateRecipe = function (Object) {
        this.recipeCreationForm.reset();
        var recipe = new ApiService.Recipe(Object);
        if (typeof $scope.selecteditem != "undefined" && typeof $scope.selecteditem._id != "undefined") {
            recipe._id = $scope.selecteditem._id;
            $scope.selecteditem = undefined;
            recipe.$update(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.num_justification);
                $scope.changePage();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
            });
        } else {
            recipe.$save(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.num_justification);
                if ($scope.redirectToMappingWhenDone)
                    window.location.href = '#/rapprochement';
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
            });
                   
        }
    }
    
    $scope.deleteRecipe = function (Object) {
        var recipe = new ApiService.Recipe();
        recipe.$delete({ params: { 'idList' : [].concat(Object._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.num_justification);
            $scope.listRecipe();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    }
    
    $scope.starEditRecipe = function (Object) {
        $scope.changePage();
        $scope.selecteditem = Object;
        $scope.num = $scope.selecteditem.num_justification;
        $scope.date = new Date($scope.selecteditem.date_operation.substring(0, 10));
        $scope.montant = $scope.selecteditem.amount;
        $scope.paymentRadio.selectedOption.id = $scope.selecteditem.modePayment;
        $scope.recipeRadio.selectedOption.id = $scope.selecteditem.recipe;
        $scope.selectedGite = { "_id" : $scope.selecteditem.gite._id };
        
        switch ($scope.selecteditem.recipe) {
            case 1:
                $scope.libelleList.selectedOption.recipe = { "name" : $scope.selecteditem.description1.libelle };
                $scope.desc = $scope.selecteditem.description1.information;
                break;
            case 2:
                $scope.nomLoc = $scope.selecteditem.description2.tenant_name;
                $scope.periodeloc = $scope.selecteditem.description2.rental_time;
                $scope.libelleList.selectedOption.location = { "name" : $scope.selecteditem.description2.libelle };
                break;
            case 3:
                $scope.datedebut = new Date($scope.selecteditem.description3.star_date.substring(0, 10));
                $scope.periode = $scope.selecteditem.description3.rental_time;
                break;
            default:
                break;
        }
   
    }
    
    //In case we are here from 'mapping controller', fill in the amount, and tell the controller to redirect to /mapping when done..
    if (PersistentDataService.mappingOp) {
        $scope.montant = PersistentDataService.mappingOp.amount;
        $scope.redirectToMappingWhenDone = true;
        PersistentDataService.mappingOp = null;
    }
});
