myApp.controller("KmCtrl", function ($scope, ApiService, Ressources, HelperService, PersistentDataService, config) {
    $scope.name = "KM";
    $scope.currentDate = PersistentDataService.date;
    
    $scope.changePage = function () {
        if ($scope.isEdit)
            $scope.isEdit = false;
        else {
            $scope.isEdit = true;
            $scope.listKm();
        }
    };
    
    $scope.$on('DateChange', function (events, args) {
        $scope.currentDate = args;
        if ($scope.isEdit)
            $scope.listKm();

    })
    
    $scope.paymentRadio = {
        selectedOption: Ressources.modePayment[0],
        availableOptions: Ressources.modePayment
    };
    
    $scope.selecteditem = undefined;
    
    ApiService.Accomodation.get(function (res) {
        $scope.accomodationList = res.message;
    }, function (err) {
        console.log(err);
    });
    
    ApiService.Vehicle.get(function (res) {
        $scope.vehicleList = res.message;
    }, function (err) {
        console.log(err);
    });
    
    $scope.selectedGite = undefined;
    $scope.selectedvehicle = undefined;
    
    $scope.listKm = function () {
        if ($scope.isEdit) {
            ApiService.Km.get({ params: { 'date.year' : $scope.currentDate.year , 'date.month' : $scope.currentDate.month } }, function (res) {
                $scope.kmList = res.message;
                $scope.reset();
                $scope.itemsByPage = 10;
            }, function (err) {
                console.log(err);
            });
        }
    }
    
    $scope.reset = function () {
        this.kmCreationForm.reset();
        $scope.selecteditem = undefined;
    }
    
    $scope.displayedKmList = [].concat($scope.kmList);
    $scope.itemsByPage = 10;
    
    $scope.createUpdateKm = function (Object) {
        this.kmCreationForm.reset();
        var km = new ApiService.Km(Object);
        if (typeof $scope.selecteditem != "undefined" && typeof $scope.selecteditem._id != "undefined") {
            km._id = $scope.selecteditem._id;
            $scope.selecteditem = undefined;
            km.$update(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.num_justification);
                $scope.changePage();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
            });
        } else {
            km.$save(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.num_justification);
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
            });
        }
    }
    
    $scope.deleteKm = function (Object) {
        var km = new ApiService.Km();
        km.$delete({ params: { 'idList' : [].concat(Object._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.num_justification);
            $scope.listKm();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    }
    
    $scope.starEditKm = function (Object) {
        $scope.changePage();
        $scope.selecteditem = Object;
        $scope.num = $scope.selecteditem.num_justification;
        $scope.paymentRadio.selectedOption.id = $scope.selecteditem.modePayment;
        $scope.selectedGite = { "_id" : $scope.selecteditem.gite._id };
        $scope.selectedvehicle = { "_id" : $scope.selecteditem.vehicle._id };
        $scope.date = new Date($scope.selecteditem.date_travel.substring(0, 10));
        $scope.nombreKms = $scope.selecteditem.km;
        $scope.start = $scope.selecteditem.start_place;
        $scope.finish = $scope.selecteditem.finish_place;
        $scope.motif = $scope.selecteditem.motif;
    }

});

