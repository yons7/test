var loginUrl = window.location.origin + '/login';
myApp.factory('AuthenticationFactory', function ($window, PersistentDataService) {
    var auth = {
        isLogged: false,
        check: function () {
            if (PersistentDataService.token && PersistentDataService.user) {
                this.isLogged = true;
            } else {
                this.isLogged = false;
                delete this.user;
            }
        }
    }
    
    return auth;
});

myApp.factory('UserAuthFactory', function ($window, $location, $http, AuthenticationFactory, PersistentDataService) {
    return {
        login: function (email, password) {
            return $http.post(loginUrl, {
                email: email,
                password: password
            });
        },
        logout: function () {
            
            if (AuthenticationFactory.isLogged) {
                
                AuthenticationFactory.isLogged = false;
                delete AuthenticationFactory.user;
                
                PersistentDataService.token = undefined;
                PersistentDataService.user = undefined;
                PersistentDataService.date = undefined;
                
                $location.path("/login");
            }
 
        }
    }
});

myApp.factory('TokenInterceptor', function ($q, $window, PersistentDataService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (PersistentDataService.token) {
                config.headers['X-Access-Token'] = PersistentDataService.token;
                config.headers['X-Key'] = PersistentDataService.user;
                config.headers['Content-Type'] = "application/json";
            }
            return config || $q.when(config);
        },
        
        response: function (response) {
            return response || $q.when(response);
        }
    };
});