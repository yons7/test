myApp.factory('HelperService', function ($http, $locale, Ressources) {
    var _helperService = {};
    
    //String Format like the .NET version
    _helperService.stringFormat = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
        
        return s;
    };

    //Convert to float from excel format (1 050,40 =>> 1050.4)
    _helperService.xlsNumberToFloat = function () {
        var s = arguments[0];
            if (s === undefined)
                return s;
        return s.replace(/ /g, '').replace(/,/g, '');
    };    
        
    //Get formatted date
    _helperService.getDateFormatted = function (format) {
        var now = new Date;
        var o = {
            "M+" : now.getMonth() + 1, //month
            "d+" : now.getDate(),    //day
            "h+" : now.getHours(),   //hour
            "m+" : now.getMinutes(), //minute
            "s+" : now.getSeconds(), //second
            "q+" : Math.floor((now.getMonth() + 3) / 3),  //quarter
            "S" : now.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    };

    //Json parse with try catch
    _helperService.TryParseJSON = function (object) {
        var result
        try {
            result = JSON.parse(object);
        } catch (e) {
            return null;
        }
        return result;
    }

    //Uses Jquery to get distinct version of array as param
    _helperService.Unique = function (array) {
        return $.grep(array, function (el, index) {
            return index === $.inArray(el, array);
        });
    }
    
    //get parametre message with Pnotification
    _helperService.displayNotification = function (typeNotification, service, typeMessage, messagedetail) {
            this.newNotification(   typeNotification, 
                                    Ressources.messages[typeMessage + typeNotification + service + 'Title'],
                                    this.stringFormat(Ressources.messages[typeMessage + typeNotification + service + 'Message'], messagedetail)
                                 );
    };
    
    //Constructs Pnotification alert
    _helperService.newNotification = function (type, title, message, container) {
        if (container) {
            PNotify.removeAll();
                permanotice = new PNotify({
                    title: title,
                    text: message,
                    type: type.toLowerCase(),
                    stack : {
                        "dir1": "down",
                        "dir2": "left",
                        "push": "top",
                        "context": container
                    },
                    after_open: function (opts) {
                        container.animate({ height: 96 }, 100);
                    },
                    after_close: function (PNotify, timer_hide) {
                        container.animate({ height: 0 }, 500);
                    },
                    width: container.width() + 'px',
                    hide: false,
                    buttons: { sticker: false }
                });
            }            
          
        else
            new PNotify({
                title: title,
                text: message,
                type: type.toLowerCase(),
                nonblock: {
                    nonblock: true,
                    nonblock_opacity: .2
                },
                buttons: {
                    show_on_nonblock: true
                }
            });        
    };
    
    //Constructs Pnotification alert
    _helperService.newPrompt = function (title, text, confirmCallBack, cancelCallBack, icon) {
        (new PNotify({
            title: title,
            text: text,
            icon: icon || 'glyphicon glyphicon-question-sign',
            hide: false,
            confirm: {
                confirm: true
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        })).get().on('pnotify.confirm', function () {
            alert('Ok, cool.');
        }).on('pnotify.cancel', function () {
            alert('Oh ok. Chicken, I see.');
        });
    };
    
    //All XLSX related functions
        _helperService.XLSXReader = function (){

            function fixdata(data) {
                    var o = "", l = 0, w = 10240;
                    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                    return o;
            };

            function ab2str(data) {
                var o = "", l = 0, w = 10240;
                for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
                return o;
            };
        
            function s2ab(s) {
                var b = new ArrayBuffer(s.length * 2), v = new Uint16Array(b);
                for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
                return [v, b];
            };
            
            function xw_noxfer(data, params, cb) {
                var worker = new Worker('libs/angular/xlsx/xlsxworker_no_xFer.js');
                worker.onmessage = function (e) {
                    switch (e.data.t) {
                        case 'ready': break;
                        case 'e': console.error(e.data.d); break;
                        case XW.msg: cb(JSON.parse(e.data.d)); break;
                    }
                };
                var arr = params.rABS ? data : btoa(fixdata(data));
                worker.postMessage({ d: arr, b: params.rABS });
            };      
        
            function xw_xfer(data, params, cb, onResult) {
                var worker = new Worker(params.rABS ? 'libs/angular/xlsx/xlsxworker_rAbs.js' : 'libs/angular/xlsx/xlsxworker_no_rAbs.js');
                worker.onmessage = function (e) {
                    switch (e.data.t) {
                        case 'ready': break;
                        case 'e': console.error(e.data.d); break;
                        default: xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r"); console.log("done"); cb(JSON.parse(xx), onResult); break;
                    }
                };
                if (params.rABS) {
                    var val = s2ab(data);
                    worker.postMessage(val[1], [val[1]]);
                } else {
                    worker.postMessage(data, [data]);
                }
            };
        
            function xw(data, params, cb, onResult) {
                if (params.transferable) xw_xfer(data, params, cb, onResult);
                else xw_noxfer(data, params, cb, onResult);
            };
                
            function to_json(workbook) {
                var result = {};
                workbook.SheetNames.forEach(function (sheetName) {
                    var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (roa.length > 0) {
                        result[sheetName] = roa;
                    }
                    var headers = [];
                    var range = XLSX.utils.decode_range(workbook.Sheets[sheetName]['!ref']);
                    var C, R = range.s.r; /* start in the first row */
                    /* walk every column in the range */
                    for (C = range.s.c; C <= range.e.c; ++C) {
                        var cell = workbook.Sheets[sheetName][XLSX.utils.encode_cell({ c: C, r: R })]/* find the cell in the first row */
                        
                        var hdr = undefined; // <-- replace with your desired default 
                        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                        
                        hdr && headers.push(hdr);
                    }
                    result[sheetName].colHeaders = headers;
                });                
                return result;
            };
        
            function process_wb(wb, cb) {
                var output = "";
                output = to_json(wb);
                
                return cb(output);
            };

            function handleDragover(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
            };

            function handleFile(e, params, onResult) {
                params.isDrop && e.stopPropagation() && e.preventDefault();
                var f = params.currentFile;
                {
                    var reader = new FileReader();
                    var name = f.name;
                    reader.onload = function (e) {                        
                        var data = e.target.result;
                        if (params.use_worker) {
                            xw(data, params, process_wb, onResult);
                        } else {
                            var wb;
                            if (params.rABS) {
                                wb = XLSX.read(data, { type: 'binary' });
                            } else {
                                var arr = fixdata(data);
                                wb = XLSX.read(btoa(arr), { type: 'base64' });
                            }
                            process_wb(wb, onResult);
                        }
                    };
                    if (params.rABS) reader.readAsBinaryString(f);
                    else reader.readAsArrayBuffer(f);
                }
            }
            return {
                handleFile : handleFile,
                xw : xw,
                xw_xfer: xw_xfer,
                process_wb: process_wb
            }
        };

        _helperService.constructBankStatement = function (date, importedSheet, availableOptions) {
            
            var HelperService = this;
            var bankStatement = {
                date : { 'year' : date.year , 'month' : date.month },
                startbalance : null,
                endbalance: null,
                transactions: []
            };
            
            $.each(importedSheet , function (id, line) {
                if (!line.$disabled) {
                    var transaction = { affectation: null };
                    $.each(importedSheet.colHeaders, function (index, headername) {
                        var matchingProperty = $.grep(availableOptions, function (e) {
                            return e.colid === index;
                        });
                        if (matchingProperty.length > 0) {
                            switch (matchingProperty[0].name) {
                                case 'Libellé/Opérations':
                                    transaction.title = line[headername];
                                    break;
                                case 'Crédit':
                                    if (HelperService.xlsNumberToFloat(line[headername])) {
                                        transaction.amount = HelperService.xlsNumberToFloat(line[headername]);
                                        if (transaction.type !== undefined) { //means we have a line with an amount in both credit and debit column, skip this line
                                            transaction.isNotValid = true;
                                            break;
                                        }                                        ;
                                        transaction.type = "Crédit";
                                    }
                                    break;
                                case 'Débit':
                                    if (HelperService.xlsNumberToFloat(line[headername])) {
                                        transaction.amount = HelperService.xlsNumberToFloat(line[headername]);
                                        if (transaction.type !== undefined) { //means we have a line with an amount in both credit and debit column, skip this line
                                            transaction.isNotValid = true;
                                            break;
                                        }                                        ;
                                        transaction.type = "Débit";
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                    if (!transaction.isNotValid && transaction.amount !== undefined && transaction.type !== undefined && transaction.title !== undefined)
                        bankStatement.transactions.push(transaction);
                }
            });

            var lastTransaction = bankStatement.transactions[bankStatement.transactions.length - 1];
            
            bankStatement.startbalance = importedSheet.startbalance;
            bankStatement.endbalance = HelperService.calculateEndBalance(bankStatement);
            
            return bankStatement;
        };

        _helperService.calculateEndBalance = function (bankStatement) {
            var result = bankStatement.startbalance;
            if (bankStatement.startbalance === undefined || bankStatement.transactions === undefined || bankStatement.transactions.length < 1)
                return null;

            $.grep(bankStatement.transactions, function (t) {
                if (t.type == "Crédit")
                    result = Math.round((result + +t.amount) * 100) / 100;

                if (t.type == "Débit")
                    result = Math.round((result - +t.amount) * 100) / 100;
            });
            return result;
    };
    
    _helperService.tableToExcel = function (tableId, worksheetName) {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); },
            format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
        var table = document.querySelector(tableId),
            ctx = { worksheet: worksheetName, table: table.innerHTML },
            href = uri + base64(format(template, ctx));
        return href;
    };
    

    _helperService.displayDashboardRecipe = function (listRecipe) {
        var dashboard = [];
        var totalLoyers = 0, totalVentes = 0, totalAutre = 0, totalPerso = 0, totalrecette = 0;
        for (i = 0; i < 12; i++) {
            var ligne = { 'title': '', 'vente' : 0, 'autre': 0, 'loyers': 0, 'perso': 0, 'total': 0 };
            ligne.title = $locale.DATETIME_FORMATS.MONTH[i];
            for (var obj in listRecipe) {
                if (listRecipe[obj].date.month === i + 1) {
                    if (listRecipe[obj].recipe === 3)
                        ligne.perso = Math.round((ligne.perso + listRecipe[obj].amount) * 100) / 100;
                    else
                        ligne.total = Math.round((ligne.total + listRecipe[obj].amount) * 100) / 100;
                    if (listRecipe[obj].recipe === 1 && listRecipe[obj].description1.libelle === Ressources.libelleList.recipe[0].name)
                        ligne.vente = Math.round((ligne.vente + +listRecipe[obj].amount) * 100) / 100;
                    if (listRecipe[obj].recipe === 1 && listRecipe[obj].description1.libelle === Ressources.libelleList.recipe[1].name)
                        ligne.autre = Math.round((ligne.autre + listRecipe[obj].amount) * 100) / 100;
                    if (listRecipe[obj].recipe === 2)
                        ligne.loyers = Math.round((ligne.loyers + listRecipe[obj].amount) * 100) / 100;
                       
                }
            }
            dashboard.push(ligne);
            totalLoyers = Math.round((totalLoyers + ligne.loyers) * 100) / 100;
            totalVentes = Math.round((totalVentes + ligne.vente) * 100) / 100;
            totalAutre = Math.round((totalAutre + ligne.autre) * 100) / 100;
            totalPerso = Math.round((totalPerso + ligne.perso) * 100) / 100;
            totalrecette = Math.round((totalrecette + ligne.total) * 100) / 100;
        }
        dashboard.push({ 'title': 'Total', 'vente' : totalVentes, 'autre': totalAutre, 'loyers': totalLoyers, 'perso': totalPerso, 'total': totalrecette });
        return dashboard;
    }
    
    
    _helperService.displayDashboardSpending = function (listSpending) { 
        var dashboard = [];
        var Lastligne = { 'title': 'Total du mois', 'month' : [], 'totalNature' : 0 };
        for (i in Ressources.natureSpend) {
            var ligne = { 'title': '', 'month' : [], 'totalNature' : 0 };
            ligne.title = Ressources.natureSpend[i].name;
            for (j = 0; j < 12; j++) {
                var sousTotalMois = 0;
                for (var obj in listSpending) {
                    if (listSpending[obj].date.month === j + 1) {
                        if (listSpending[obj].description !== undefined && listSpending[obj].description.nature === ligne.title) {
                            sousTotalMois = Math.round((sousTotalMois + listSpending[obj].amount) * 100) / 100;
                        }
                    }
                }
                sousTotalMois = sousTotalMois * -1;
                ligne.month.push(sousTotalMois);
                ligne.totalNature = Math.round((ligne.totalNature + sousTotalMois) * 100) / 100;
                Lastligne.month[j] = Math.round(((Lastligne.month[j] === undefined ? 0 : Lastligne.month[j]) + sousTotalMois) * 100) / 100;
            }
            Lastligne.totalNature = Math.round((Lastligne.totalNature + ligne.totalNature) * 100) / 100;
            dashboard.push(ligne);
        }
        dashboard.push(Lastligne);
        return dashboard;
    }
    
    
    _helperService.displayDashboardkm = function (listkm) {
        var dashboard = [];
        var totalKmsYear = 0, totalMontantYear = 0;
        for (i = 0; i < 12; i++) {
            var totalKms = 0, totalMontant = 0;
            for (var obj in listkm) {
                var ligne = { 'mois': '', 'libelle' : '', 'kms': 0, 'taux': 0, 'montant': 0 };
                ligne.mois = $locale.DATETIME_FORMATS.MONTH[i];
               
                if (listkm[obj].date.month === i + 1) {
                    totalKms = Math.round((totalKms + listkm[obj].km) * 100) / 100;              
                    totalMontant = Math.round((totalMontant + listkm[obj].amount) * 100) / 100;
                    ligne.kms = listkm[obj].km;
                    ligne.montant = listkm[obj].amount;
                    ligne.taux = listkm[obj].taux;
                    ligne.libelle = listkm[obj].date_travel.substring(5, 10).replace("-", "/") + ' ' + listkm[obj].start_place + ' => ' + listkm[obj].finish_place;
                    dashboard.push(ligne);
                }               
            }
            totalKmsYear = Math.round((totalKmsYear + totalKms) * 100) / 100;
            totalMontantYear = Math.round((totalMontantYear + totalMontant) * 100) / 100;
            dashboard.push({ 'mois': $locale.DATETIME_FORMATS.MONTH[i], 'libelle' : 'Total mois', 'kms': totalKms, 'taux': '', 'montant': totalMontant });
        }
        dashboard.push({'libelle' : 'Total des Kilométres', 'kms': totalKmsYear, 'taux': 0, 'montant': totalMontantYear });
        return dashboard;
    }

    _helperService.getJustificationFriendlyName = function (justification) {
        var matchingType = (justification.recipe !== undefined && justification.recipe !== null) ? justification.recipe : justification.spend;
        var matchingRessource = (justification.recipe !== undefined && justification.recipe !== null) ? Ressources.typeRecipes : Ressources.typeSpend;
        var modePayment;
        var justificationType;

        $.each(Ressources.modePayment, function (i, mode) {
            if (mode.id === justification.modePayment) {
                modePayment = mode.name
                return false
            };
        });
        
        $.each(matchingRessource, function (i, r) {
            if (r.id === matchingType) {
                justificationType = r.name
                return false
            }            ;
        });     

        return modePayment + ' pour ' + justificationType;
    }

    _helperService.displaySynthése = function () {
        var dashboard = [];
        $scope.years = new Array();
        for (var i = Ressources.initYear; i <= now.getFullYear(); i++) {
            var ligne = { 'year': i , 'month' : [] };     
            for (j = 0; j < 12; j++) {                       
                ligne.month.push();     
            }
            dashboard.push(ligne);
        }       
        return dashboard;
    }

    return _helperService;
});