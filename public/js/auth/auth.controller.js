myApp.controller('LoginCtrl', ['$scope', '$window', '$location', 'UserAuthFactory', 'AuthenticationFactory', 'Ressources', 'HelperService', 'PersistentDataService',
  function ($scope, $window, $location, UserAuthFactory, AuthenticationFactory, Ressources, HelperService, PersistentDataService) {
        
        $scope.login = function (userObject) {            
            this.loginForm.reset();
            UserAuthFactory.login(userObject.email, userObject.password).success(function (data) {
                    
                AuthenticationFactory.isLogged = true;
                AuthenticationFactory.user = data.user;
                    
                PersistentDataService.token = data.token;
                PersistentDataService.user = data.user; // to fetch the user details on refresh
                    
                $location.path("/");
 
            }).error(function (status) {
                $scope.authError = true;
            });
        };

        $scope.clearAuthError = function () { $scope.authError = false; };
    }
]);