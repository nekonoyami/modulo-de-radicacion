function abrirSeleccionador(id) {
    var elemento = document.getElementById(id)
    elemento.click()
}

//control principal de la pagina
app.controller('control', function($scope, cargarActo, $modal, enviarRadicacion) {
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
                var jsons = {
                    observaciones: $scope.observacion,
                    estados: $scope.estadoActual,
                    adjuntos: $scope.archivos
                }
                var resultados = eleminarSalientes(elemento.entity, $scope.requisitos_seleccionados, jsons)
                $scope.requisitos_seleccionados = resultados.lista
                $scope.observacion = resultados.datos.observaciones
                $scope.archivos = resultados.datos.adjuntos
                $scope.estadoActual = resultados.datos.estados

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
        }, {
            field: "activo_acto",
            displayName: "Esta activo"
        }]
    }

    //servicio de angular que se encarga de solicitar los actos con sus respectivos requisitos
    cargarActo.success(function(res) {
        $scope.actos = darFormato(res)
        res = null
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
                $scope.estadoActual[index].estado = $scope.estado[3]
                    //si el requisito tenia archivos adjuntos, estos son borrados si se escribe algun comentario
                $scope.archivos[index] = []
            } else
                $scope.estadoActual[index].estado = $scope.estado[0]
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
            abrirSeleccionador(id)
                //si el requisito tiene un comentario, este es eliminado al momento de agregar algun archivo
            $scope.observacion[id] = ''
        }
    }

    $scope.consola = function() {
        console.log('requisitos_seleccionados', $scope.requisitos_seleccionados);
        console.log('observacion', $scope.observacion);
        console.log('estadoActual', $scope.estadoActual);
        console.log('archivos', $scope.archivos);
        console.log('seleccionados', $scope.seleccionados);
    }

    //scope que se encarga de cambiar el estado de un requisito ('', N/A, PD, OK)
    $scope.cambiarEstado = function(indice) {
        var blCambiado = false
        console.log(indice);
        if ($scope.estadoActual[indice].estado.estado == $scope.estado[3].estado) {
            $scope.estadoActual[indice].estado = $scope.estado[0]
            $scope.observacion[indice] = ''
            $scope.archivos[indice] = []
        } else {
            for (var i = 0; i < $scope.estado.length && !blCambiado; i++) {
                if ($scope.estadoActual[indice].estado.estado == $scope.estado[i].estado) {
                    $scope.estadoActual[indice].estado = $scope.estado[i + 1]
                    blCambiado = true
                }
            }
        }
    }



    $scope.validarRadicacion = function() {
        var blInvalido = false,
            mensaje = 'por favor verifique que el/los siguientes requisitos esten bien diligenciados \n',
            faltantes = [],
            archivos = [],
            requisitos = [],
            actos = [];
        /**
         * se recorren las litas que contienen (archivos, observaciones), teniendo encuenta el estado actual
         * de cada requisito y se valida si tiene archivos adjuntos o comentarios segun el estado el cual tengan
         * actualmente
         **/
        angular.forEach($scope.estadoActual, function(valor, llave, obj) {
                //console.log('llave', llave);
                //console.log('valor', valor);
                //se valida que el estado no este como vacio = '' o si esta como PD (comentario) tenga un comentario
                if (valor.estado.estado == '' || (valor.estado.estado == 'PD' && $scope.observacion[llave] == '')) {
                    faltantes.push(llave)
                    blInvalido = true
                        //se valida que si un requisito esta como OK entonces por lo menos tenga un archivo adjunto
                } else if ($scope.archivos[llave].length == 0 && valor.estado.estado == 'OK') {
                    faltantes.push("el requisito: " + llave + ", esta en 'OK' pero no tiene ningun archivo adjunto \n")
                    blInvalido = true
                }
                if (!blInvalido) {
                    if (valor.estado.estado == 'OK') {
                        requisitos.push({
                            id: valor.id_req,
                            requisito: llave,
                            protocolo: valor.protocolo,
                            comentario: 'OK'
                        })
                        for (var i = 0; i < $scope.archivos[llave].length; i++) {
                            archivos.push($scope.archivos[llave][i].archivo)
                        }
                    }
                    if (valor.estado.estado == 'PD') {
                        requisitos.push({
                            id: valor.id_req,
                            requisito: llave,
                            comentario: $scope.observacion[llave],
                            protocolo: valor.protocolo,
                        })
                    }
                    if (valor.estado.estado == 'N/A') {
                        requisitos.push({
                            id: valor.id_req,
                            requisito: llave,
                            comentario: 'N/A',
                            protocolo: valor.protocolo,
                        })
                    }
                }
            })
            //si algun requisito no esta correctamente diligenciado se muestra una ventana avisando del error
        if (blInvalido) {
            requisitos = []
            $modal.open({
                animation: true,
                templateUrl: 'plantillas/advertencia.html',
                controller: 'modalAdvertencia',
                resolve: {
                    lista: function() {
                        return {
                            mensaje: mensaje,
                            advertencia: faltantes
                        }
                    }
                }
            })
        } //fin del if
        else {
            //se recojen los actos seleccionados
            for (var i = 0; i < $scope.seleccionados.length; i++) {
                actos.push({
                    nombre: $scope.seleccionados[i].nombre_acto,
                    codigo: $scope.seleccionados[i].codigo
                })
            }
            enviarRadicacion.enviarRadicacion(requisitos, actos, archivos).then(function(res) {
                console.log('respuesta', res);
            })
        }

    }


})


//control que corresponde a la ventana modalv 
.controller('modalComentario', function($scope, $modalInstance, comentario) {

    console.log('comentario', comentario);
    $scope.comment = comentario
    $scope.cancelar = function() {
        $modalInstance.dismiss('cancel')
    }

    $scope.ok = function() {
        $modalInstance.close($scope.comment)
    }
})

.controller('modalArchivos', function($scope, lista, $modalInstance) {

    $scope.id = lista.indice;
    $scope.archivosCargados = lista.listaArchivos;
    console.log($scope.archivosCargados);

    $scope.agregarArchivo = function() {
        abrirSeleccionador($scope.id)
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