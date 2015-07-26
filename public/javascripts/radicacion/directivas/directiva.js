app.directive('selectionModel', function($parse, $sce) {
    return {
        restrict: 'A',
        link: function($scope, elem, attrs) {
            elem.on('change', function() {
              //$scope.archivos[attrs.selectionModel].push(elem[0].files[0])
              console.log(elem);
              console.log(attrs);
              var ruta = window.URL.createObjectURL(elem[0].files[0])
              ruta =  $sce.trustAsHtml(ruta)
              console.log(ruta);
             // console.log($sce.trustAsResourceUrl(ruta));
              $scope.archivos[attrs.id].push({archivo: elem[0].files[0], ruta: ruta})
              elem.value = ''
            })
        }
    }
})

.directive('listaActos',function () {
  return {
    templateUrl: 'plantillas/lista_actos.html',
    restrict: 'E',
    scope: {datos: '='},
    controller: 'control'
  }
})

.directive('listaRequisitos',function () {
  return {
    templateUrl: 'plantillas/lista_requisitos.html',
    restrict: 'E',
    scope: {requeridos: '='},
    controller: 'control'
  }
})