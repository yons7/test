myApp.controller("HeaderCtrl", function ($scope, $rootScope, $location, Ressources, UserAuthFactory, PersistentDataService, config) {
        $scope.isActive = function (route) {
            return route === $location.path();
        }
        $scope.logout = function () {
            UserAuthFactory.logout();
        }
        
        if (PersistentDataService.user) {
            var currentUser = PersistentDataService.user;
            $scope.userName = currentUser.firstname + ' ' + currentUser.lastname;
            if (currentUser.role == 1) {
                $scope.isAdmin = true;
            } else {
                $scope.isAdmin = false;
            }
        }
        
        var now = new Date()

        $scope.years = new Array();
        for (var i = config.init.year; i <= now.getFullYear(); i++) {
            $scope.years.push(i);
        }
 
    if (!PersistentDataService.date) {
            $scope.currentDate = { month  : now.getMonth(), year : now.getFullYear() };
            PersistentDataService.date = $scope.currentDate;
        } else {
            $scope.currentDate = PersistentDataService.date;
            $rootScope.$broadcast('DateChange', $scope.currentDate);
        }
        
        $scope.setCurrentDate = function () {
            $scope.currentDate.month = now.getMonth();
            $scope.currentDate.year = now.getFullYear();
            PersistentDataService.date = $scope.currentDate;
            $rootScope.$broadcast('DateChange', $scope.currentDate);
        }

        $scope.setMonth = function (index) {
            $scope.currentDate.month = index;
            PersistentDataService.date = $scope.currentDate;
            $rootScope.$broadcast('DateChange', $scope.currentDate);
        }
        
        $scope.setYear = function (index) {
            $scope.currentDate.year = index;
            PersistentDataService.date = $scope.currentDate;
            $rootScope.$broadcast('DateChange', $scope.currentDate);
        }
});