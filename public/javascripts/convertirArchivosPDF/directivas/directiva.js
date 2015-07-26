app.directive('selectionModel', function() {
    return {
        restrict: 'A',
        link: function($scope, elem, attrs) {
            elem.on('change', function() {
                $scope.tramsformar(elem[0].files[0])
                file.value = ''
            })
        }
    }
})