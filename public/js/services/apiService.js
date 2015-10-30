myApp.factory('ApiService', function ($http, $resource, config) {
        return {
            User         : $resource(config.userApiUrl + '/:id', { id: '@_id' }),                    
            Accomodation : $resource(config.accomodationApiUrl + '/:id', { id: '@_id' }),
            Spending     : $resource(config.spendingApiUrl + '/:id', { id: '@_id' }), 
            Scales       : $resource(config.scalesApiUrl + '/:id', { id: '@_id' }),             
            BankStatement: $resource(config.bankStatementApiUrl + '/:id', { id: '@_id' }),                 
            Recipe       : $resource(config.recipeApiUrl + '/:id', { id: '@_id' }),
            Vehicle      : $resource(config.vehicleApiUrl + '/:id', { id: '@_id' }),
            Km           : $resource(config.kmApiUrl + '/:id', { id: '@_id' })                  
        }
});