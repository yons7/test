myApp.factory('PersistentDataService', function () {
    var _persistentDataService = {

        _mappingOp : null,      // used to store mapping data (in case jump from mapping controller to spending/recipe controller

        get user() {
            var _user;
            try {
                _user = JSON.parse(window.sessionStorage.easyUser);
            } catch (e) {
                return _user;
            }
            return _user;
        },
        set user(user) {
            window.sessionStorage.easyUser = JSON.stringify(user);
        },
        get token() {
            return window.sessionStorage.easyToken;
        },
        set token(token) {
            window.sessionStorage.easyToken = token;
        },
        get date() {
            var _date;
            try {
                _date= JSON.parse(window.sessionStorage.easyDate);
            } catch (e) {
                return _date;
            }
            return _date;
        },
        set date(date) {
            window.sessionStorage.easyDate = JSON.stringify(date);
        },
        get mappingOp() {
            return this._mappingOp;
        },
        set mappingOp(obj) {
            this._mappingOp = obj;
        }
    };    
    return _persistentDataService;
});