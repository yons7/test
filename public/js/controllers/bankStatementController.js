myApp.controller("BankStatementCtrl", function ($scope, Ressources, HelperService, ApiService, PersistentDataService, config) {
    $scope.name = "Relevebancaire";
    $scope.columnList = {
        availableOptions: [{ id: '0', name: '' },
                                { id: '1', name: 'Libellé/Opérations' },
                                { id: '2', name: 'Crédit' },
                                { id: '3', name: 'Débit' }]
    };
    
    $scope.currentDate = PersistentDataService.date;
    $scope.$on('DateChange', function (events, args) {
        $scope.currentDate = args;
        $scope.getCurrentBankStatement();
        angular.element($('#xlfile')).val(null);
    });
    
    $scope.isOptionDisabled = function (index) {
        return function (option) {
            return !(option.colid != undefined && option.colid != index);
        };
    };
    
    $scope.updateOptions = function (colindex) {
        $.grep($scope.columnList.availableOptions, function (e) {
            if ($scope.columnList.selectedOption[colindex] && e.id == $scope.columnList.selectedOption[colindex].id) {
                //remove all associations between headers and our column
                e.colid != undefined && e.colid === colindex && delete e.colid;
                
                if ($scope.columnList.selectedOption[colindex] && $scope.columnList.selectedOption[colindex].id != 0)
                    e.colid = colindex;     //associate current column with the selected header
            }
        });
    };
    
    //disassociate column head from available options => to free it to be used by others
    $scope.clearOption = function (colindex) {
        $.grep($scope.columnList.availableOptions, function (e) {
            e.colid != undefined && e.colid === colindex && delete e.colid;
        });
    };
    
    $scope.XLSXParams = { rABS: true, use_worker: true, transferable: true };    //init everything with true 
    //check browser to see if we can use a worker or a reader    
    $scope.XLSXParams.rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
    $scope.XLSXParams.use_worker = typeof Worker !== 'undefined';
    $scope.XLSXParams.transferable = $scope.XLSXParams.use_worker;
    
    
    $scope.startImport = function (e, isDrop) {
        var XLSXReader = HelperService.XLSXReader();
        $scope.XLSXParams.currentFile = isDrop ? e.originalEvent.dataTransfer.files[0] : e.files[0];
        $scope.XLSXParams.isDrop = isDrop;
        
        XLSXReader.handleFile(isDrop ? e.originalEvent : e, $scope.XLSXParams, onImport);
        
        $scope.currentFileInDropZone = $scope.XLSXParams.currentFile.name;
    };
    
    var resultJSON;
    var onImport = function (result) {
        $scope.$apply(function () {
            resultJSON = result;
            if (resultJSON)
                $scope.sheetList = Object.keys(resultJSON);
            
            $scope.selectedSheet = resultJSON[$scope.sheetList[0]];
            updateSheetDisplay();
        });
    };
    var updateSheetDisplay = function () {
        
        $scope.columnList.selectedOption = [];
        
        //reset drop down lists
        $.grep($scope.columnList.availableOptions, function (e) {
            delete e.colid;
        });
        
        //match xls columns with default columns (debit, credit..)
        $.each($scope.selectedSheet.colHeaders, function (i, colheader) {
            $scope.columnList.selectedOption[i] = $scope.columnList.availableOptions[0];
            
            $.grep($scope.columnList.availableOptions, function (e) {
                if (colheader === e.name) {
                    e.colid = i;
                    $scope.columnList.selectedOption[i] = e;
                }
            });
        });
        
        //disable lines which contain less than 3 pieces of information by default
        $.each($scope.selectedSheet , function (id, line) {
            if (Object.keys(line).length < 3)
                line.$disabled = true;
        });
        
        //check previous months bank statement for its last balance;
        ApiService.BankStatement.get({ params: { date : { 'year' : $scope.currentDate.year , 'month' : $scope.currentDate.month - 1 } }, getone : true }, function (res) {
            var previousBankStatement = res.message;
            if (previousBankStatement !== null && previousBankStatement !== undefined)
                $scope.selectedSheet.startbalance = +previousBankStatement.endbalance
            else //if no previous bankstatement get first transaction containing the term "solde" and a numeric value, assume this is the startbalance
            {
                var containsSoldeAndValue = { s: false, v: false, value: null };
                $.each($scope.selectedSheet[0], function (key, value) {
                    if ($.type(value) === "string" && value.indexOf("solde") >= 0)
                        containsSoldeAndValue.s = true;
                    if (value && $.isNumeric(value)) {
                        containsSoldeAndValue.v = true;
                        containsSoldeAndValue.value = value;
                    }
                });
                
                if (containsSoldeAndValue.s && containsSoldeAndValue.v)
                    $scope.selectedSheet.startbalance = +containsSoldeAndValue.value;
            }
                
        }, function (err) { });
    };
    
    $scope.selectSheet = function (sheet) {
        $scope.selectedSheet = resultJSON[sheet];
        updateSheetDisplay();
    }
    
    $scope.checkSelected = function (sheet) {
        if ($scope.selectedSheet === resultJSON[sheet])
            return "btn btn-primary";
        else return "btn btn-default";
    }
    
    $scope.checkRow = function (row) {
        if (row.$disabled)
            return "ng-scope danger greyedOut";
        else return "ng-scope";
    }
    
    $scope.displayedStatementLineList = [].concat($scope.selectedSheet);
    $scope.itemsByPage = 100;
    
    $scope.currentFileInDropZone = "Glissez ici un fichier XLSX / XLSM / XLSB / ODS / XLS / XML";
    
    $scope.checkStatementValid = function () {
        var atLeastOneRowEnabled = false;
        var allHeadersAreAssigned = false;
        if ($scope.selectedSheet !== undefined) {
            $.grep($scope.selectedSheet , function (line) {
                if (!line.$disabled) {
                    atLeastOneRowEnabled = true;
                    return;
                }
            });
            allHeadersAreAssigned = true;
            $.grep($scope.columnList.availableOptions, function (header) {
                if (header.colid == undefined && header.id != 0) {
                    allHeadersAreAssigned = false;
                    return;
                }
            });
        }
        return (atLeastOneRowEnabled && allHeadersAreAssigned && $scope.selectedSheet.startbalance !== undefined && $scope.selectedSheet.startbalance >= 0) ? "btn btn - warning": "btn btn - warning disabled";
    };
    
    $scope.saveStatement = function () {
        //some sort of reset algo..
        var bankStatementObject = {
            date : { 'year' : $scope.currentDate.year , 'month' : $scope.currentDate.month },
            startbalance : null,
            endbalance: null,
            transactions: []
        };
        
        var bankStatement = new ApiService.BankStatement(HelperService.constructBankStatement($scope.currentDate, $scope.selectedSheet, $scope.columnList.availableOptions));
        bankStatement.$save(function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.add, res.message.date.month + "/" + res.message.date.year);
            if ($scope.redirectToMappingWhenDone)
                window.location.href = '#/rapprochement';
            $scope.getCurrentBankStatement();
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.add, err.data.errormessage);
        });
    };
    
    $scope.deleteStatement = function () {
        var bankStatement = new ApiService.BankStatement();
        bankStatement.$delete({ params: { 'idList' : [].concat($scope.currentBankStatement._id) } }, function (res) {
            HelperService.displayNotification(Ressources.enums.notification.success, $scope.name , Ressources.enums.operation.delete, res.message.date.month + "/" + res.message.date.year);
            $scope.getCurrentBankStatement();
            angular.element($('#xlfile')).val(null);
        }, function (err) {
            HelperService.displayNotification(Ressources.enums.notification.error, $scope.name , Ressources.enums.operation.delete, err.data.errormessage);
        });
    };
    
    $scope.getCurrentBankStatement = function () {
        $scope.selectedSheet = null;
        $scope.displayedStatementLineList = null;
        
        ApiService.BankStatement.get({ params: { date : { 'year' : $scope.currentDate.year , 'month' : $scope.currentDate.month } }, getone : true }, function (res) {
            $scope.currentBankStatement = res.message;
            var columnHeaders = [];
            if ($scope.currentBankStatement !== null && $scope.currentBankStatement !== undefined)
                $scope.displayedCurrentBankStatement = [].concat($scope.currentBankStatement.transactions);
        }, function (err) { });
    };
    
    $scope.getCurrentBankStatement();
    
    //In case we are here from 'mapping controller', tell the controller to redirect to /mapping when done..
    if (PersistentDataService.mappingOp) {
        $scope.redirectToMappingWhenDone = true;
        PersistentDataService.mappingOp = null;
    }
});