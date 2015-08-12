
var app = angular.module('app', ['ngSanitize', 'ui.bootstrap', 'ngCookies', 'ngRoute', 'ngGrid'])



//.config(function($sceDelegateProvider) {
//    $sceDelegateProvider.resourceUrlWhitelist([
//        // Allow same origin resource loads.
//        'self',
//        // Allow loading from our assets domain.  Notice the difference between * and **.
//        '**'
//    ]);
//
//});
app.config(function ($routeProvider) {
    $routeProvider.when("/", {
            controller: "loginController",
            templateUrl: "../plantillas/login.html"
                //        templateUrl : "./index.html"
        })
        .when("/procesoRadicacion", {
            controller: "control",
            templateUrl: "../plantillas/radicacion.html"
        })
        .otherwise({
            redirectTo: "/"
        })
});


//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas
//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas
app.factory("auth", function ($cookies, $cookieStore, $location, $http, $window) {
    return {
        login: function (username, password) {


            $http.post('/radicacion/validar', {
                usuario: username,
                clave: password
            }).success(function (data) {
                informacion = data;
                console.log(informacion);

                if (informacion.length === 0) {
                    $window.alert("ERROR : Su usuario o contraseña son incorrectos")
                } else {
                    var letraAcesso = informacion[0].acceso.indexOf('V');
                    console.log('V:', letraAcesso);
                    var activo = informacion[0].activo;
                    console.log('activo:', activo);
                    // se evalua si el usuario que esta intentando acceder esta activo 
                    if (activo === 'SI') {
                        // se evalua si el usuario (ACTIVO = SI) tiene los permisos para acceder
                        if(letraAcesso > 0){
                        $window.alert("MENSAJE: " + "\n" + "Bienvenido usuario  -> " + username);
                         //creamos la cookie con el nombre que nos han pasado como usuario
                        $cookies.put('username', username);

                        //                       $window.location.href="../templates/proceso.html";
                        $location.path('/procesoRadicacion');
                        console.log("ruta ", $window.location.pathname);
                        }
                        else{
                            // en caso de que el usuario este activo pero no tenga permisos
                            $window.alert('MENSAJE : Usuario -> '+ username + ' no posee los permisos suficientes para acceder');
                           
                        }
                    }
                    else{
                        // en caso de que el usuario no se encuentre activo , se le informa
                         $window.alert("MENSAJE: " + "\n" + "usuario -> " + username + " Lo sentimos , su usuario no se encuentra activo ");
                    }
                }

            });



        },
        logout: function () {

            $location.path('/');
            $cookieStore.remove("username");
        },
        checkStatus: function () {
            //creamos un array con las rutas que queremos controlar
            var rutasPrivadas = ["/procesoRadicacion","/"];
            // controlamos el acceso a las rutas con la cookie almacenada en accesoCookie
            accesoCookie = $cookies.get('username');
            // en caso de que el usuario intente accerder a los procesos sin estar logueado
            if (this.in_array($location.path(), rutasPrivadas) && typeof (accesoCookie) == "undefined") {
                //                 $window.alert('Mensaje : ' + '\n' + 'inicie Sesion para tener acceso a la ruta , Gracias..');
                $location.path("/");
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if (this.in_array("/", rutasPrivadas) && typeof (accesoCookie) != "undefined") {

                // redireccionamos a la ruta 

                $location.path("/procesoRadicacion");
            }
        },
        in_array: function (needle, haystack) {
            var key = '';
            for (key in haystack) {
                if (haystack[key] == needle) {
                    return true;
                }
            }
            return false;
        }
    }
});




//creamos el controlador pasando $scope y $http, así los tendremos disponibles
app.controller('loginController', function ($scope, auth, $cookieStore, $window, $cookies) {

    // al cargar la pagina borramos las cookies 
    //    $cookieStore.remove("username");
    //    console.log("ruta ", $window.location.pathname);

    $scope.login = function () {
        auth.login($scope.username, $scope.password);
    }

});


//creamos el controlador pasando $scope y auth
app.controller('homeController', function ($scope, $cookies, auth, $window, $http) {

    //la función logout que llamamos en la vista llama a la función
    console.log("ruta ", $window.location.pathname);
    //logout de la factoria auth
    $scope.logout = function () {
        auth.logout();
    }

});


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
        // filtro de la tabla
        showFilter : true,
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

/**
 * funcion que se encarga de buscar las posisciones de un elemento con el mismo "nombre_acto" dentro de una lista
 * y retornar un array donde estan las posiciones de los elementos repetidos
 * @elemento: objeto a buscar dentro del array
 * @array: lista en la cual se encuentran los elementos repetidos
 **/
function buscarRepetidos(elemento, array) {
    var repetidos = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i] !== 'vacio') {
            if (elemento.nombre_acto == array[i].nombre_acto) {
                repetidos.push(i)
            }
        }
    }
    return repetidos
}

/**
 * funcion que resive el array que corresponde a la consulta sql que consulta los procesos de radicacion
 * retorna una un nuevo array con solo un acto el cual contiene todos los requisitos
 * necesarios
 **/
function darFormato(array) {
    var lista = array;
    var nuevoFormato = [];
    for (var i = 0; i < lista.length; i++) {
        if (lista[i] !== "vacio") {
            //console.log('app.js - 16 :: pos', i);
            //console.log('app.js - 17 :: lista', lista);
            //console.log('app.js - 18 :: lista', lista[i].nombre_acto);

            var repetidos = buscarRepetidos(lista[i], lista)
            var requisitos = [],
                nombre = '',
                id = '',
                codigo = '',
                activo = '';
            for (var j = 0; j < repetidos.length; j++) {
                //id_actos.push(lista[repetidos[j]].id_acto)
                //console.log('app.js - 27 :: pos', repetidos[j]);
                //console.log('app.js - 28 :: lista', lista);
                nombre = lista[repetidos[j]].nombre_acto
                id = lista[repetidos[j]].id_acto
                requisitos.push({
                    requisito: lista[repetidos[j]].Requisito,
                    id_req: lista[repetidos[j]].id_req,
                    protocolo: lista[repetidos[j]].protocolo
                })
                codigo = lista[repetidos[j]].codigo
                activo = lista[repetidos[j]].activo_acto
                lista[repetidos[j]] = 'vacio'
            }


            nuevoFormato.push({
                    id_acto: id,
                    nombre_acto: nombre,
                    codigo: codigo,
                    Requisito: requisitos,
                    activo_acto: activo
                })
                /*            var nuevo = borrarRepetidos(lista, repetidos)
                            console.log(nuevo);
                            lista = nuevo*/
                /*console.log('app.js - 46 :: largo', largo);*/
        }
    }

    return nuevoFormato
}

/*function borrarRepetidos(lista, repetidos) {
    for (var i = 0; i < repetidos.length; i++) {
        if (lista[repetidos[i]] === 'vacio') {
            console.log('app.js - 57 :: borrados', lista.splice(repetidos[i], 1))
            console.log('app.js - 57 :: posicion', repetidos[i])
        }
    }
    return lista
}*/

/**
 * funcion que retorna un json que corresponde a un acto, con el siguiente formato:
 * *codigo: codigo del acto
 * *requisito: array con los requisitos que son visibles en la pagina
 * *repetidos: array con los requisitos que ya se muestran en la pagina (los requsisitos repetidos)
 * *archivo: json que contendra los archivos que se hallan cargadao a este acto (llave = requisito)
 * *comentario: json que contendra los comentarios hechos sobre un requisito de este acto
 * @seleccionados corresponde a la lista con los requisitos que ya han sido seleccionados
 * @requisistos corresponde a la lista de los requisitos que se van a verifcar si ya han sido seleccionados
 **/
function requisitosRepetidos(seleccionados, requisitos) {
    var formato = {
        codigo: seleccionados.codigo,
        requisitos: seleccionados.Requisito,
        repetidos: [],
        archivos: {},
        comentario: {}
    }
    if (requisitos.length <= 0) {
        return formato;
    } else {
        var nuevaLista = [],
            noMostrar = [];
        for (var i = 0; i < seleccionados.Requisito.length; i++) {
            if (!existe(seleccionados.Requisito[i], requisitos))
                nuevaLista.push(seleccionados.Requisito[i])
            else
                noMostrar.push(seleccionados.Requisito[i])
        }
        formato.requisitos = nuevaLista;
        formato.repetidos = noMostrar;
        return formato
    }
}

/**
 * funcion que se encarga de verificar si los requisitos estan repetidos en un lista dada
 * en cuyo caso retorna true y la posicion o false en caso contrario
 **/
function existe(elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        for (var j = 0; j < lista[i].requisitos.length; j++) {
            if (elemento.requisito === lista[i].requisitos[j].requisito)
                return true
        }
    }
    return false
}


/**
 * funcion que elimina los elementos cuando una columna de la grilla es deseleccionada
 * @saliente: json que contiene el array representa los requisitos que estan en el elemento que es deseleccionado
 * @requsisitos: array que representa todos los elementos que han sido seleccionados hasta el momento
 *               en que esta funcion es invocada
 **/

function eleminarSalientes(saliente, lista, json) {
    //variable que guarda la posicion del requisito y su obejeto padre
    var resultado;
    //se recorre la lista de requisitos del elemento que fue deseleccionado
    for (var i = 0; i < saliente.Requisito.length; i++) {
        if (!seMuestraRequisito(saliente.codigo, saliente.Requisito[i], lista)) {
            resultado = existeRepetido(saliente.Requisito[i], lista);
            if (resultado.boolean) {
                //se obtiene un requisito de un elemento en su lista de repetidos y se cambia a su lista de requisitos  
                lista[resultado.posOjeto].requisitos.push(lista[resultado.posOjeto].repetidos[resultado.posRequisito])
                    //se elimina el elemento de la lista de repetidos
                lista[resultado.posOjeto].repetidos.splice(resultado.posRequisito, 1)
            }
        }
    }
    //se recorre la lista de requisitos
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].codigo === saliente.codigo) {
            for (var j = 0; j < lista[i].requisitos.length; j++) {
                delete json.adjuntos[lista[i].requisitos[j].requisito]
                delete json.estados[lista[i].requisitos[j].requisito]
                delete json.observaciones[lista[i].requisitos[j].requisito]
            }
            //se elimina el requisito que fue deseleccionado de la lista principal (la cual esta representada por "lista") 
            lista.splice(i, 1)
        }
    }
    return {
        lista: lista,
        datos: json
    }
}

function existeRepetido(elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        for (var j = 0; j < lista[i].repetidos.length; j++) {
            if (elemento.requisito === lista[i].repetidos[j].requisito)
                return {
                    boolean: true,
                    posOjeto: i,
                    posRequisito: j
                }
        }
    }
    return {
        boolean: false
    }
}


/**
 * funcion que se encarga de buscar si un requisito en espefico ya esta en la array de "requisitos" de un elemento
 * de la lista (sin tener en cuenta a el elemento de donde este proviene)
 * retornar true si encuentra uno o false en caso contrario
 * @codigo: codigo del elemento del cual proviene el requisito a buscar
 * @elemento: requisito a buscar
 * @lista: array que representa a la lista principal donde estan todos los elementos seleccionados
 **/
function seMuestraRequisito(codigo, elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        if (!(lista[i].codigo === codigo)) {
            for (var j = 0; j < lista[i].requisitos.length; j++) {
                if (elemento.requisito === lista[i].requisitos[j].requisito)
                    return true
            }
        }
    }
    return false
}


//mientras corre la aplicación, comprobamos si el usuario tiene acceso a la ruta a la que está accediendo
app.run(function ($rootScope, auth) {
    //al cambiar de rutas
    $rootScope.$on('$routeChangeStart', function () {
        //llamamos a checkStatus, el cual lo hemos definido en la factoria auth
        //la cuál hemos inyectado en la acción run de la aplicación
        auth.checkStatus();
    })
})