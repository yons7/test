myApp.controller("SpendingCtrl", function ($scope, ApiService, Ressources, HelperService, PersistentDataService, config) {
    $scope.name = "Depense";
    $scope.currentDate = PersistentDataService.date;
    
    $scope.changePage = function () {
        if ($scope.isEdit)
            $scope.isEdit = false
        else {
            $scope.isEdit = true;
            $scope.listSpending();
        }
                
    };
    
    $scope.$on('DateChange', function (events, args) {
        $scope.currentDate = args;
        if ($scope.isEdit)
            $scope.listSpending();

    })
    
    var modePayment = Ressources.modePayment[0];
    $scope.paymentRadio = {
        selectedOption: modePayment,
        availableOptions: Ressources.modePayment
    };
    
    
    $scope.spendRadio = {
        selectedOption: Ressources.typeSpend[0],
        availableOptions: Ressources.typeSpend
    };
    
    $scope.selecteditem = undefined;
    
    ApiService.Accomodation.get(function (res) {
        $scope.accomodationList = res.message;
    }, function (err) {
        console.log(err);
    });
    
    $scope.selectedGite = undefined;
    $scope.selectedNature = undefined;
    
    $scope.listNatureSpend = Ressources.natureSpend;
    
    $scope.infoBull = function () {
        if ($scope.selectedNature !== undefined)
            HelperService.newNotification('info', $scope.selectedNature.name, $scope.selectedNature.description !== undefined ? $scope.selectedNature.description : "Non information disponible sur la nature de dépense.");
    };
    
    $scope.listSpending = function () {
        if ($scope.isEdit) {
            ApiService.Spending.get({ params: { 'date.year' : $scope.currentDate.year , 'date.month' : $scope.currentDate.month } }, function (res) {
                $scope.spendingList = res.message;
                $scope.reset();
                $scope.itemsByPage = 10;
            }, function (err) {
                console.log(err);
            });
        }
    }
    
    $scope.reset = function () {
        this.spendingCreationForm.reset();
        $scope.selecteditem = undefined;
    }
    
    $scope.displayedSpendingList = [].concat($scope.spendingList);
    $scope.itemsByPage = 10;
    
    $scope.createUpdateSpending = function (Object) {
        this.spendingCreationForm.reset();
        var spending = new ApiService.Spending(Object);
        if (typeof $scope.selecteditem != "undefined" && typeof $scope.selecteditem._id != "undefined") {
            spending._id = $scope.selecteditem._id;
            $scope.selecteditem = undefined;
            spending.$update(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.num_justification);
                $scope.changePage();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
            });
        } else {
            spending.$save(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.num_justification);
                if ($scope.redirectToMappingWhenDone)
                    window.location.href = '#' + config.routes.mapping.RouteUrl;
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
            });
        }
    }
    
    $scope.deleteSpending = function (Object) {
        var spending = new ApiService.Spending();
        spending.$delete({ params: { 'idList' : [].concat(Object._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.num_justification);
            $scope.listSpending();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    }
    
    $scope.starEditSpending = function (Object) {
        $scope.changePage();
        $scope.selecteditem = Object;
        $scope.num = $scope.selecteditem.num_justification;
        $scope.date = new Date($scope.selecteditem.date_operation.substring(0, 10));
        $scope.montant = $scope.selecteditem.amount;
        $scope.paymentRadio.selectedOption.id = $scope.selecteditem.modePayment;
        $scope.spendRadio.selectedOption.id = $scope.selecteditem.spend;
        $scope.selectedGite = { "_id" : $scope.selecteditem.gite._id };
        
        if ($scope.selecteditem.spend == 1) {
            $scope.nomFour = $scope.selecteditem.description.provider_name;
            $scope.desc = $scope.selecteditem.description.description;
            $scope.selectedNature = { 'name' : $scope.selecteditem.description.nature };
        } else {
            $scope.nomLoc = $scope.selecteditem.information.tenant_name;
            $scope.periode = $scope.selecteditem.information.rental_time;
            $scope.motif = $scope.selecteditem.information.reason_rembourssement;
        }
    }
    
    //In case we are here from 'mapping controller', fill in the amount, and tell the controller to redirect to /mapping when done..
    if (PersistentDataService.mappingOp) {
        $scope.montant = PersistentDataService.mappingOp.amount;
        $scope.redirectToMappingWhenDone = true;
        PersistentDataService.mappingOp = null;
    }
});
