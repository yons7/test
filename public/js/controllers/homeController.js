myApp.controller("HomeCtrl", function ($scope, ApiService, Ressources, HelperService, PersistentDataService) {
    $scope.name = "Synthése";  
    
    if (!PersistentDataService.date) {
        var now = new Date()
        $scope.currentDate = { month  : now.getMonth(), year : now.getFullYear() };
    } else {
        $scope.currentDate = PersistentDataService.date;
    }
    
    var year = $scope.currentDate.year;
    
    $scope.$on('DateChange', function (events, args) {
        $scope.currentDate = args;
        if (year !== $scope.currentDate.year) {
            $scope.getCurrentBankStatement();
            $scope.getCurrentScales();
        }
        year = $scope.currentDate.year;
    })
    
    
    $scope.getCurrentScales = function () {
        ApiService.Scales.get({ params: { 'year' : $scope.currentDate.year } }, function (res) {
            if (res.message.length === 9) {
                $scope.isScale = true;
            } else {
                $scope.isScale = false;
            }
        }, function (err) {
            console.log(err);
        });
    }
    
    $scope.getCurrentBankStatement = function () {
        ApiService.BankStatement.get({ params: { 'date.year' : $scope.currentDate.year } }, function (res) {
            var currentBankStatement = res.message;
            $scope.synthesis = [];
            var now = new Date()
            for (current in $scope.months) {
                var ligne = {};
                if ($scope.currentDate.year === now.getFullYear() && current > now.getMonth()) {
                    ligne = { month : $scope.months[current], statut : undefined, color : 'default' , etat : 'Hors Date' };
                } else {
                    ligne = { month : $scope.months[current], statut : -1, color : 'red' , etat : 'A faire' };
                    for (statement in currentBankStatement) {
                        if (currentBankStatement[statement].date.month - 1 == current) {
                            ligne.statut = currentBankStatement[statement].status !== undefined ? currentBankStatement[statement].status : -1;
                            switch (ligne.statut) {
                                case 0:
                                case 1:
                                case 2:
                                    ligne.etat = 'En cours';
                                    ligne.color = 'yellow';
                                    break;
                                case 3:
                                    ligne.etat = 'Exercice cloturé';
                                    ligne.color = 'green';
                                    break;
                                default:
                                    ligne.etat = 'A faire';
                                    ligne.color = 'red';
                                    break;
                            }
                        }
                    }
                }
                $scope.synthesis.push(ligne);
            }
        }, function (err) {
            console.log(err);
        });
    };
    
    $scope.getCurrentBankStatement();
    $scope.getCurrentScales();

});
