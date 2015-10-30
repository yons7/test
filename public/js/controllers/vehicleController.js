myApp.controller("VehicleCtrl", function ($scope, ApiService, Ressources, HelperService, config) {
    $scope.name = "Vehicule";
    
    var obj = Ressources.vehicle[0];
    $scope.paramlist = {
        selectedOption: obj,
        availableOptions: Ressources.vehicle
    };
    
    $scope.createUpdateVehicule = function (Object) {
        this.vehiculeCreationForm.reset();
        var vehicle = new ApiService.Vehicle(Object);
        if (typeof $scope.selecteditem != "undefined" && typeof $scope.selecteditem._id != "undefined") {
            vehicle._id = $scope.selecteditem._id;
            $scope.selecteditem = undefined;
            vehicle.$update(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.immatriculation);
                $scope.listVehicules();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
            });
        } else {
            vehicle.$save(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.immatriculation);
                $scope.listVehicules();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
            });
        }
    }
    
    $scope.deleteVehicule = function (Object) {
        var vehicle = new ApiService.Vehicle();
        vehicle.$delete({ params: { 'idList' : [].concat(Object._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.immatriculation);
            $scope.listVehicules();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    }
    
    $scope.listVehicules = function () {
        ApiService.Vehicle.get(function (res) {
            $scope.vehicleList = res.message;
            $scope.itemsByPage = 10;
            $scope.atLeastOneRecord = (res.message.length > 0);
        }, function (err) {
            console.log(err);
        });
    }
    
    $scope.reset = function () {
        this.vehiculeCreationForm.reset();
        $scope.selecteditem = undefined;
    }
    
    $scope.listVehicules();
    
    $scope.displayedVehicleList = [].concat($scope.vehicleList);
    $scope.itemsByPage = 10;
    
    $scope.selecteditem = undefined;
    
    $scope.starEditVehicule = function (Object) {
        $scope.selecteditem = Object;
        $scope.immatriculation = $scope.selecteditem.immatriculation;
        if ($scope.selecteditem.type === "Voiture") {
            $scope.paramlist.selectedOption = Ressources.vehicle[0];
        } else if ($scope.selecteditem.type === "Deux-roues") {
            $scope.paramlist.selectedOption = Ressources.vehicle[1];
        } else {
            $scope.paramlist.selectedOption = Ressources.vehicle[2];
        }
        $scope.marque = $scope.selecteditem.marque;
        $scope.paramlist.selectedOption.value = $scope.selecteditem.cv;
        $scope.modele = $scope.selecteditem.modele;
    }
});
