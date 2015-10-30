myApp.controller("MappingCtrl", function ($scope, Ressources, HelperService, ApiService, PersistentDataService, config) {
        //$scope.name = "Relevebancaire";
                
        $scope.currentDate = PersistentDataService.date;
        $scope.$on('DateChange', function (events, args) {
            $scope.currentDate = args;
            $scope.getCurrentBankStatement();
        });       
   
        $scope.selections = {
            availableOptions: [{ id: '0', name: '' }],
            selectedOption: []
        };

        $scope.displayedStatementLineList = [].concat($scope.selectedSheet);
        $scope.itemsByPage = 100;
    

        $scope.getCurrentBankStatement = function () {
            $scope.currentBankStatement = null;
            $scope.displayedStatementLineList = null;

            ApiService.BankStatement.get({ params: { date : { 'year' : $scope.currentDate.year , 'month' : $scope.currentDate.month }}, getone : true }, function (res) {
                $scope.currentBankStatement = res.message;
                $scope.operationType = null;
                if ($scope.currentBankStatement !== null && $scope.currentBankStatement !== undefined) {
                    //determine what type of operation to start based on statement status
                    switch ($scope.currentBankStatement.status.toString()) {
                        case Ressources.enums.statementStatus.KO:
                        case Ressources.enums.statementStatus.ONLY_DEBIT_OK:
                            $scope.operationType = "Crédit";
                            break;
                        case Ressources.enums.statementStatus.ONLY_CREDIT_OK:
                            $scope.operationType = "Débit";
                            break;
                        case Ressources.enums.statementStatus.OK:
                            $scope.operationType = "None";
                            break;
                        default:
                            break;
                    }
                    
                    $scope.displayedStatementLineList = [].concat($scope.currentBankStatement.transactions);                   
                    $scope.getCurrentJustifications();
                }
            }, function (err) { });
        };

        $scope.getCurrentJustifications = function () {
            $scope.justificationList = null;
            
            var matchingApiService = ($scope.operationType === "Crédit") ? ApiService.Recipe : ApiService.Spending;
            
            matchingApiService.get({ params: { 'date.year' : $scope.currentDate.year , 'date.month' : $scope.currentDate.month } }, function (res) {
                $scope.justificationList = res.message;
                if ($scope.justificationList !== null && $scope.justificationList !== undefined) {
                    $.each($scope.justificationList, function (i, justif) {
                        justif.friendlyname = HelperService.getJustificationFriendlyName(justif);                        
                    });
                    $.each($scope.currentBankStatement.transactions, function (i, t) {
                        $scope.selections.selectedOption[i] = $scope.selections.availableOptions[0];
                        $.each($scope.justificationList, function (index, justif) {
                            if (t.affectation === justif._id)
                                $scope.selections.selectedOption[i] = justif;
                        });
                    });
                }
                $scope.displayedJustificationList = [].concat($scope.justificationList);  
            }, function (err) { });
        };

        $scope.getCurrentBankStatement();

        $scope.updateOptions = function (index) {
            if ($scope.selections.selectedOption[index] !== null && $scope.selections.selectedOption[index] !== undefined)
                $scope.currentBankStatement.transactions[index].affectation = $scope.selections.selectedOption[index]._id;
            //if ($scope.selections.selectedOption[index] === null)
            //    $scope.currentBankStatement.transactions[index].affectation = null;
        };

        $scope.isOptionDisabled = function (index) {
            return function (justif) {
                var isAlreadyAssigned = $scope.isAlreadyAssigned(justif);
                var isAssignedToCurrentTransaction = $scope.currentBankStatement.transactions[index].affectation === justif._id;
                var isMatchingAmount = $scope.currentBankStatement.transactions[index].amount === justif.amount;

                //to be eligible for affectation, justif must match amount + not already affected or if affected to current instance transaction
                return (isMatchingAmount && (!isAlreadyAssigned || (isAlreadyAssigned && isAssignedToCurrentTransaction)));
            };
        };

        $scope.isAlreadyAssigned = function (justif) { 
            var result = false;
            $.each($scope.currentBankStatement.transactions, function (i, t) {
                if (t.affectation === justif._id) {
                    result = true;
                    return false;
                }
            });
            return result;
        };

        $scope.checkExerciceIsValid = function () {
             return ($scope.allOperationsAreAssigned() && $scope.allJustificationsAreAssigned()) ? "btn btn - warning": "btn btn - warning disabled";
        };

        $scope.deleteSingleJustification = function (justificationObject) {
            var justificationListToRemove = [].concat(justificationObject._id);            
            deleteJustifications(justificationListToRemove);
        };
        
        $scope.deleteAllJustifications = function () {
            var justificationListToRemove = [];
            $.each($scope.justificationList, function (index, justif) {
                if (!$scope.isAlreadyAssigned(justif))
                    justificationListToRemove.push(justif._id);
            });
            deleteJustifications(justificationListToRemove);           
        };
        
        var deleteJustifications = function (justificationListToRemove) { 
            var matchingApiService = ($scope.operationType === "Crédit") ? ApiService.Recipe : ApiService.Spending;
            var justification = new matchingApiService();
            
            justification.$delete({ params: { 'idList' : justificationListToRemove } }, function (res) {
                HelperService.displayNotification(Ressources.enums.notification.success, '' , Ressources.enums.operation.delete, null);
                $scope.getCurrentJustifications();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, '' , Ressources.enums.operation.delete, err.data.errormessage);
            });        
        };

        $scope.allJustificationsAreAssigned = function () {
            var result = false;
            if ($scope.justificationList) {
                result = true;
                $.each($scope.justificationList, function (i, justif) {
                    if (!$scope.isAlreadyAssigned(justif)) {
                        result = false;
                        return false;
                    }
                });
            }
            return result;
        };

        $scope.allOperationsAreAssigned = function () {
            var result = false;
            if ($scope.currentBankStatement && $scope.currentBankStatement.transactions) {
                result = true;
                $.each($scope.currentBankStatement.transactions, function (i, t) {
                    if (t.type === $scope.operationType && (t.affectation === undefined || t.affectation === null)) {
                        result = false;
                        return false;
                    }
                });
            }
            return result;
        };
                
        $scope.addJustification = function (transaction) {
            //first save current bank statement in its state
            var bankStatement = new ApiService.BankStatement($scope.currentBankStatement);
            bankStatement.$update(function (res) {
                //then redirect to either recette or depenses
                PersistentDataService.mappingOp = transaction;
                window.location.href = '#' + (($scope.operationType === "Crédit") ? config.routes.recipe.RouteUrl : config.routes.spending.RouteUrl);
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, 'Relevebancaire' , Ressources.enums.operation.update, err.data.errormessage);
            });
        };

        $scope.saveStatementAndContinue = function () { 
            //first save current bank statement in its state
            var bankStatement = new ApiService.BankStatement($scope.currentBankStatement);
        
        if (bankStatement.status.toString() === Ressources.enums.statementStatus.ONLY_CREDIT_OK)
            bankStatement.status = Ressources.enums.statementStatus.OK;
        else
            bankStatement.status = Ressources.enums.statementStatus.ONLY_CREDIT_OK;

            bankStatement.$update(function (res) {
                $scope.getCurrentBankStatement();
            }, function (err) {
                HelperService.displayNotification(Ressources.enums.notification.error, 'Relevebancaire' , Ressources.enums.operation.update, err.data.errormessage);
            });
        };

    $scope.selectOnlyOptionAvailable = function (i, justifList, transaction) {        
        if (justifList && justifList.length === 1 && $scope.selections.selectedOption[i] === $scope.selections.availableOptions[0] && !$scope.selections.selectedOption[i].forcedClear) {
            $scope.selections.selectedOption[i] = justifList[0];
            transaction.affectation = justifList[0]._id;
        }
    };

    $scope.tellNextScopeToRedirectBackHere = function() {
        PersistentDataService.mappingOp = true;
    };
    
    $scope.clearOption = function (i, transaction) {
        $scope.selections.selectedOption[i] = $scope.selections.availableOptions[0];
        $scope.selections.selectedOption[i].forcedClear = true;
        transaction.affectation = null;
    };    
});