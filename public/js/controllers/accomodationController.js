myApp.controller("AccomodationCtrl", function ($scope, ApiService, Ressources, HelperService, config) {
    $scope.name = "Gite";
    $scope.countrylist = {
        selectedOption: { id: 'FR', name: 'France' },
        selectedOption_edit: null,
        availableOptions: $.map(Ressources.countrylist, function (n, i) { return { id: i, name: n }; })
    };
    
    $scope.createNewAccomodation = function (accomObject) {
        
        this.accomodationCreationForm.reset();
        var accomodation = new ApiService.Accomodation(accomObject);
        
        accomodation.$save(function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.name);
            $scope.listAccomodations();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
        });
    }
    
    $scope.startEdit = function (accomObject) {
        this.accomodationCreationForm.reset();
        $scope.id_edit = accomObject._id;
        $scope.accomname_edit = accomObject.name;
        $scope.address_edit = accomObject.address;
        $scope.city_edit = accomObject.city;
        $scope.countrylist.selectedOption_edit = {
            id : accomObject.country, 
            name: $.map($scope.countrylist.availableOptions, function (obj) {
                if (obj.id === accomObject.country)
                    return obj.name;
            })
        };
        $scope.description_edit = accomObject.description;
    }
    
    $scope.editAccomodation = function (accomObject) {
        
        this.accomodationCreationForm.reset();
        var accomodation = new ApiService.Accomodation(accomObject);
        
        accomodation.$update(function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.name);
            $scope.resetEditionForm();
            $scope.listAccomodations();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
        });
    }
    
    $scope.deleteAccomodation = function (accomObject) {
        var accomodation = new ApiService.Accomodation();
        accomodation.$delete({ params: { 'idList' : [].concat(accomObject._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.name);
            $scope.listAccomodations();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    }
    
    $scope.listAccomodations = function () {
        ApiService.Accomodation.get(function (res) {
            $scope.accomodationList = res.message;
            $scope.itemsByPage = 10;
        }, function (err) {
            console.log(err);
        });
    }
    
    $scope.listAccomodations();
    
    $scope.displayedAccomodationList = [].concat($scope.accomodationList);
    $scope.itemsByPage = 10;
    
    $scope.$watch('displayedAccomodationList', function (row) {
        // before table display changes, we need to get the edit form out of the table (otherwise its lost)
        $scope.resetEditionForm();
    }, true);
});