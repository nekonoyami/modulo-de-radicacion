function abrirSeleccionador(id) {
    var elemento = document.getElementById(id)
    elemento.click()
}

//control principal de la pagina
app.controller('control', function($scope, cargarActo, $modal, $timeout) {
    //scope que representa el array de los elemento seleccionados en el ng-grid
    $scope.seleccionados = [];
    //scope que guarda las observaciones que se muestran en la pagina (ventana)
    $scope.observacion = {};
    //scope que guarda un json con los archivos que se han cargado a cada requisito
    $scope.archivos = {}
        //scope que representa el estado en el que puede estar un requisito
    $scope.estado = [{
        estado: '',
        color: 'warning'
    }, {
        estado: 'N/A',
        color: 'danger'
    }, {
        estado: 'OK',
        color: 'success'
    }, {
        estado: 'PD',
        color: 'info'
    }];
    //scope que guarda el estado en el cual se encuetra actualmente cada requisito en especifico en la pagina
    $scope.estadoActual = {},
        //scope que guarda los json en los cuales se guarda los requisitos de los actos que se han seleccionado
        $scope.requisitos_seleccionados = [];
    //scope que corresponde a las opciones del ng-grid
    $scope.gridOptions = {
        data: 'actos',
        showFooter: true,
        selectedItems: $scope.seleccionados,
        //funcion que se activa despues de seleccionar o deseleccionar un elemento del ng-grid
        afterSelectionChange: function(elemento) {
            //se ejecuta si el elemento ha sido seleccionado
            if (elemento.selected) {
                $scope.requisitos_seleccionados.push(requisitosRepetidos(elemento.entity, $scope.requisitos_seleccionados))
            }
            //se ejecuta si el elemento ha sido deseleccionado
            else {
                $scope.requisitos_seleccionados = eleminarSalientes(elemento.entity, $scope.requisitos_seleccionados)
                if ($scope.requisitos_seleccionados.length <= 0) {
                    $scope.observacion = {}
                    $scope.estadoActual = {}
                    $scope.archivos = {}
                }
            }
        },
        columnDefs: [{
            field: "nombre_acto",
            displayName: "Descripcion",
        }, {
            field: "codigo",
            displayName: "codigos",
        }]
    }

    //servicio de angular que se encarga de solicitar los actos con sus respectivos requisitos
    cargarActo.success(function(res) {
        $scope.actos = darFormato(res)
    })

    /**
     * scope (funcion) que abre una ventana modal la cual funciona para insertar un comentario en un determinado
     * requisito
     **/
    $scope.agregarComentario = function(index, codigo) {
        //se configura la ventana modal
        console.log('control.js - 48::elemento ', codigo);
        var instanciaModal = $modal.open({
                animation: true,
                templateUrl: 'plantillas/observacion.html',
                controller: 'modalComentario',
                size: 'sm',
                resolve: {
                    comentario: function() {
                        return $scope.observacion[index]
                    }
                }
            })
            //se obtiene el texto insertado en el text area de la ventana modal
        instanciaModal.result.then(function(comentario) {
            //console.log('control.js - 45::index', index);
            $scope.observacion[index] = comentario
            if ($scope.observacion[index] !== '') {
                $scope.estadoActual[index] = $scope.estado[3]
                    //si el requisito tenia archivos adjuntos, estos son borrados si se escribe algun comentario
                $scope.archivos = {}
            } else
                $scope.estadoActual[index] = $scope.estado[0]
                //console.log('.js - 62:: observacion', $scope.observacion);
                //console.log('control.js - 63 :: parent' );
        })
    }

    //scope que se encarga de agregar los archivos que son seleccionados por el usuario
    $scope.seleccionar = function(id) {
        if ($scope.archivos[id].length > 0) {
            $modal.open({
                animation: true,
                templateUrl: 'plantillas/listaArchivos.html',
                controller: 'modalArchivos',
                resolve: {
                    lista: function() {
                        return {
                            listaArchivos: $scope.archivos[id],
                            indice: id
                        }
                    }
                }
            })

        } else {
            $timeout(function() {
                    abrirSeleccionador(id)
                }, 0, true)
                //si el requisito tiene un comentario, este es eliminado al momento de agregar algun archivo
            $scope.observacion[id] = ''
        }
    }

    $scope.consola = function() {
        console.log('control.js - 127::seleccionados', $scope.requisitos_seleccionados);
        console.log('control.js - 128::observacion', $scope.observacion);
        console.log('control.js - 129::estadoActual', $scope.estadoActual);
        console.log('control.js - 130::archivos', $scope.archivos);
        console.log('control.js - 131::datos', datos);
      

    }

    //scope que se encarga de cambiar el estado de un requisito ('', N/A, PD, OK)
    $scope.cambiarEstado = function(indice) {
        var blCambiado = false
        console.log(indice);
        if ($scope.estadoActual[indice].estado == $scope.estado[3].estado) {
            $scope.estadoActual[indice] = $scope.estado[0]
            $scope.observacion[indice] = ''
            $scope.archivos = {}
        } else {
            for (var i = 0; i < $scope.estado.length && !blCambiado; i++) {
                if ($scope.estadoActual[indice].estado == $scope.estado[i].estado) {
                    $scope.estadoActual[indice] = $scope.estado[i + 1]
                    blCambiado = true
                }
            }
        }
    }



    $scope.validarRadicacion = function() {
        var blInvalido = false,
            mensaje = 'por favor verifique que el/los siguientes requisitos esten bien diligenciados \n',
            requisitos = [],
            paraEnviar = [];
        /**
         * se recorren las litas que contienen (archivos, observaciones), teniendo encuenta el estado actual
         * de cada requisito y se valida si tiene archivos adjuntos o comentarios segun el estado el cual tengan
         * actualmente
         **/
        angular.forEach($scope.estadoActual, function(valor, llave, obj) {
                console.log('control.js - 143::llave', llave);
                console.log('control.js - 143::valor', valor);
                //se valida que el estado no este como vacio = '' o si esta como PD (comentario) tenga un comentario
                if (valor.estado == '' || (valor.estado == 'PD' && $scope.observacion[llave] == '')) {
                    requisitos.push(llave)
                    blInvalido = true
                        //se valida que si un requisito esta como OK entonces por lo menos tenga un archivo adjunto
                } else if ($scope.archivos[llave].length == 0 && valor.estado == 'OK') {
                  requisitos.push("el requisito: " + llave + "esta en 'OK' pero no tiene ningun archivo adjunto \n")
                    blInvalido = true
                }
                if (!blInvalido) {
                    if (valor.estado == 'OK') {
                        paraEnviar.push({
                            requisito: llave,
                            archivos: $scope.archivos[llave]
                        })
                    }
                    if (valor.estado == 'PD') {
                        paraEnviar.push({
                            requisito: llave,
                            comentario: $scope.observacion[llave]
                        })
                    }
                    if (valor.estado == 'N/A') {
                        paraEnviar.push({
                            requisito: llave,
                            comentario: 'N/A'
                        })
                    }
                }
            })
            //si algun requisito no esta correctamente diligenciado se muestra una ventana avisando del error
        if (blInvalido) {
            $modal.open({
                animation: true,
                templateUrl: 'plantillas/advertencia.html',
                controller: 'modalAdvertencia',
                resolve: {
                    lista: function() {
                        return {
                            mensaje: mensaje,
                            advertencia: requisitos
                        }
                    }
                }
            })
        } //fin del if
        else {

        }

    }


})


//control que corresponde a la ventana modalv 
.controller('modalComentario', function($scope, $modalInstance, comentario) {

    console.log('control.js - 56:: comentario', comentario);
    $scope.comment = comentario
    $scope.cancelar = function() {
        $modalInstance.dismiss('cancel')
    }

    $scope.ok = function() {
        $modalInstance.close($scope.comment)
    }
})

.controller('modalArchivos', function($scope, lista, $modalInstance, $timeout) {

    $scope.id = lista.indice;
    $scope.archivosCargados = lista.listaArchivos;
    console.log($scope.archivosCargados);

    $scope.agregarArchivo = function() {
        $timeout(function() {
            abrirSeleccionador($scope.id)
        }, 0, true)
    }

    $scope.borrarArchivo = function(indice) {
        $scope.archivosCargados.splice(indice, 1)
    }

    $scope.cerrar = function() {
        $modalInstance.dismiss('cancel')
    }

})

.controller('modalAdvertencia', function($scope, $modalInstance, lista) {
    $scope.advertencia = lista;

    $scope.cerrar = function() {
        $modalInstance.dismiss('cancel')
    }
})

.config(function($sceDelegateProvider, $compileProvider) {
    /*    $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            '**'
        ]);*/
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|blob):/);

});