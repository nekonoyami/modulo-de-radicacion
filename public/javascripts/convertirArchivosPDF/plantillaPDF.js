app.directive('ver', function() {
    return {
        templateUrl: '../plantillas/plantilla.html',
        restrict: 'E',
        scope: {},
        link: function postLink($scope, elem, attrs) {
            $scope.mostrarPDF = function(ruta) {
                //$scope.ruta = ''
                var val = $sce.trustAsResourceUrl(ruta);
                console.log(val);
                $scope.ruta = 'file:///' + val
                pdf.src = 'file:///' + val
                    //$scope.ruta = ruta

            }
        }
    }
})