myApp.controller("ScalesCtrl", function ($scope, ApiService, Ressources, HelperService, PersistentDataService, config) {
        $scope.name = "Bareme";
        $scope.currentDate = PersistentDataService.date;

        var obj = Ressources.vehicle[0];
        $scope.paramlist = {
            selectedOption: obj,
            availableOptions: Ressources.vehicle
        };        

        $scope.displayedIntervalList = function () {
        ApiService.Scales.get({ params: { 'type' : $scope.paramlist.selectedOption.name, 'year' : $scope.currentDate.year } }, function (res) {
                $scope.intervalList = res.message;
                if (($scope.intervalList.length === 5 && $scope.paramlist.selectedOption.name === 'Voiture') ||
                    ($scope.intervalList.length === 3 && $scope.paramlist.selectedOption.name === 'Deux-roues') ||
                    ($scope.intervalList.length === 1 && $scope.paramlist.selectedOption.name === 'Cyclomoteur')) {
                    $scope.isScaleFull = true;
                } else {
                    $scope.isScaleFull = false;
                }    
            }, function (err) {
                console.log(err);
            });
            $scope.selecteditem = undefined;
        }
       
    $scope.getScale = function (Object) {
            $scope.selecteditem = Object;
            $scope.paramlist.selectedOption.value = Object.cv;
        }
        
        $scope.updateScale = function (Object) {
            if ($scope.selecteditem !== undefined && $scope.selecteditem._id !== undefined) {
                var scale = new ApiService.Scales($scope.selecteditem);
                scale.$update(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.update, res.message.type + ' (' + res.message.cv + ')');
                    $scope.displayedIntervalList();
                }, function (err) {
                    HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.update, err.data.errormessage);
                });
            } else {
                var scale = new ApiService.Scales(Object);
                scale.$save(function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.type + ' (' + res.message.cv + ')');
                    $scope.displayedIntervalList();
                }, function (err) {
                    HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
                });                   
            }
        }
        
        $scope.displayedIntervalList();
        
        $scope.$on('DateChange', function (events, args) {
            $scope.currentDate = args;
            $scope.displayedIntervalList();
        }) 
             
});