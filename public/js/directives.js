myApp.directive('confirmDeleteInline', function () {
    return {
        replace: true,
        templateUrl: 'partials/templates/deleteConfirmationInline.html',
        scope: { onConfirm: '&', onStartEdit: '&', allowEdit: "=", inlineEdit: "=" },
        controller: function ($scope) {
            $scope.isDeleting = false;
            $scope.startDelete = function () {
                return $scope.isDeleting = true;
            };
            $scope.cancel = function () {
                return $scope.isDeleting = false;
            };
            $scope.startEdit = function () {
                return $scope.onStartEdit();
            };
            return $scope.confirm = function () {
                return $scope.onConfirm();
            };
        }
    };
});

myApp.directive('intableEdit', function () {
    return {
        replace: true,
        link: function ($scope, $elem, $attrs) {
            if ($elem.hasClass('startEditBtn')) {
                $elem.bind('click', function () {
                    var currentRow = $elem.parents('tr');
                    var editionForm = $('form[name="editionForm"]');
                    $elem.parents('table').find('tr').show();                    //show all table rows
                    currentRow.toggle();                                         //hide current row being edited
                    editionForm.detach().insertAfter(currentRow);
                    $('#EditionRow').remove();
                    editionForm.wrap("<tr id='EditionRow'></tr>").wrap("<td colspan=7></td>").show();    //insert edition form after the current row being edited        
                    $('html, body').scrollTop(editionForm.offset().top - $('.navbar').height());
                });
            }
            else if ($elem.hasClass('cancelEditBtn')) { 
                $elem.bind('click', function () {                    
                    $elem.parents('table').find('tr').show();                    //show all table rows
                    $("#EditionRow").hide();                                     //hide edition form  
                    editionForm.reset();
                });            
            }
        },
        controller: function ($scope) {
            return $scope.resetEditionForm = function () {
                $('form[name="editionForm"]').parent().attr('id') !== "editionFormContainer" && $('form[name="editionForm"]').appendTo($("#editionFormContainer"));
            };
        }
    };
});

myApp.directive('fileDropzone', function () {
    return {
        replace: true,
        link: function ($scope, $elem, $attrs) {

            function handleDragover(e) {
                e.originalEvent.stopPropagation();
                e.originalEvent.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                this.className = 'upload-drop-zone drop';
                return false;
            };

            function handleDragleave(e) {
                this.className = 'upload-drop-zone';
                return false;
            };
            
            function handleDrop(e) {
                angular.element(this).scope().startImport(e, true);
                this.className = 'upload-drop-zone';
                return false;
            };
             
            $elem.bind({
                dragenter: handleDragover,
                dragover: handleDragover,
                dragleave: handleDragleave,
                drop: handleDrop
            });
            
        }
    };
});

myApp.directive('confirmDeleteForm', function () {
    return {
        replace: true,
        templateUrl: 'partials/templates/deleteConfirmationForm.html',
        scope: { onConfirm: '&', btnText: "=" },
        controller: function ($scope) {
            $scope.isDeleting = false;
            $scope.startDelete = function () {
                return $scope.isDeleting = true;
            };
            $scope.cancel = function () {
                return $scope.isDeleting = false;
            };
            return $scope.confirm = function () {
                return $scope.onConfirm();
            };
        }
    };
});