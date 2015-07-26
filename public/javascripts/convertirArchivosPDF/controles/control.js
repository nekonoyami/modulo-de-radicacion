app.controller('control', ['$scope', 'convertir', '$sce', '$modal', 'cargarServicios', function($scope, convertir, $sce, $modal, cargarServicios) {


    $scope.cargados = []
    $scope.services = []
    $scope.copias = 0
    cargarServicios.success(function(data) {
        console.log(data.nombre_ta);
        for (var i = 0; i < data.length; i++) {
            $scope.services.push(data[i])
        }
    })

    $scope.tramsformar = function(archivo) {
        convertir.convertir(archivo).then(function(res) {
            console.log(res);
            if (typeof res.data.nombre !== 'undefined')
                $scope.cargados.push(res.data)
            else
                alert(res.data)
        })
    }

    $scope.mostrarPDF = function(ruta) {
        /*        if ($scope.ruta == '' || typeof $scope.ruta == 'undefined') {
                    //window.open('plantillas/plantilla.html')
                    $scope.ruta = ''
                    var val = $sce.trustAsResourceUrl(ruta);
                    console.log(val);
                    div = $('#pdf').clone()
                    $scope.ruta = 'file:///' + val
                } else {
                    $('#pdf').remove()
                    console.log(div);
                    var val = $sce.trustAsResourceUrl(ruta);
                    console.log(val);
                    $scope.ruta = 'file:///' + val
                    $('#ver').append(div) 
                    $('#pdf').attr('ng-src', $scope.ruta)
                    $('#pdf').attr('src', $scope.ruta)  
                }*/

        /*      $modal.open('ej.html')
              
                    $scope.ruta = ''
                    
                    console.log(val);
                    //div = $('#pdf').clone()
                    $scope.ruta = 'file:///' + val
                   // $scope.mostrar = !$scope.mostrar*/
        $scope.ruta = '';
        // var val = $sce.trustAsResourceUrl(ruta);
        // $scope.ruta = 'file:///' + val
        $scope.ruta = ruta
        var ventanaModal = $modal.open({
            templateUrl: 'verPdf',
            size: 'lg',
            controller: 'modalPdf',
            resolve: {
                ruta: function() {
                    return $scope.ruta
                }
            }
        })
    }

    $scope.mostrarClave = function() {
        var servicios = [];
        /*        angular.forEach($scope.cargados, function(valor, llave, obj) {
                    servicios.push({
                        servicio: valor,
                        archivo: $scope.cargados[llave],
                        copias: $scope.copias[llave]
                    })
                    console.log('copias', typeof $scope.copias[llave]);

                    console.log('obj', obj);
                })*/
        var copias = verificarCopias($scope.copias, $scope.cargados)
        var servicios = verificarServicios($scope.servicios, $scope.cargados)

        if (copias === null && servicios === null) {
            var servicios = []
            for (var i = 0; i < $scope.cargados.length; i++) {
                servicios.push({
                    servicio: $scope.servicios[i].nombre_ta,
                    nombreTabla: $scope.servicios[i].nombre_tabla,
                    archivo: $scope.cargados[i],
                    copias: $scope.copias[i]
                })
                console.log(servicios);
            }
            var ventanaModal = $modal.open({
                templateUrl: 'verClave',
                size: 'lg',
                controller: 'modalClave',
                resolve: {
                    servicios: function() {
                        return servicios
                    }
                }
            })
        } else
            alert((copias !== null && servicios !== null) ? copias + '\n' + servicios : (copias !== null) ? copias : servicios)


    }



}])

.controller('modalPdf', ['$scope', 'ruta', function($scope, ruta) {
    console.log(ruta);
    $scope.rutas = ruta
}])

.controller('modalClave', function($scope, clave, $modalInstance, enviar, servicios, verificar) {
    $scope.clave = ''
    $scope.respuesta = ''
    clave.clave().then(function(res) {
        console.log(res.data);
        $scope.res = res
        $scope.clave = 'fila: ' + res.data[0].fila + ", columna: " + res.data[0].col
        var id = $scope.res.id
        console.log($scope.clave);
        datos = {
            nombre: null,
            idClave: res.data[0].id
        }
    })

    $scope.validar = function() {
        verificar.verificar($scope.respuesta).then(function(res) {
            console.log(res);
            if (res.data[0] == 1) {
                alert('se verifico el codigo')
                $scope.guardar();
            } else
                alert('clave codigo erroneo por favor intente nuevamente')
        })
    }
    $scope.guardar = function() {
        console.log('servicios', servicios);
        console.log('datos', datos);
        enviar.enviar(datos, servicios)
        $scope.cargados = []
        servicios = []
    }


})