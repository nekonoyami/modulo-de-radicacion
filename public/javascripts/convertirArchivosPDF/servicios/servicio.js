//servicio que se encarga de enviar los archivos para que sean convertidos a PDF
app.service('convertir', ['$http', '$q', function($http, $q) {
    this.convertir = function(archivo) {
        var deferred = $q.defer();
        var formulario = new FormData();
        formulario.append('file', archivo);
      console.log('servicio.js - 7::form', formulario.file);
        return $http.post('/express/convertir', formulario, {
                headers: {
                    'Content-type': undefined
                },
                transformRequest: formulario
            })
            .success(function(data) {
                deferred.resolve(data)
            })
            .error(function(err) {
                deferred.reject(err)
            })
        return deferred.promise;
    }
}])

//servicio que se encarga de enviar los datos neesarios para realizar la sertificacion web
.service('enviar', ['$http', '$q', function($http, $q) {
    this.enviar = function(datos, servicios) {
        var deferred = $q.defer()
        return $http.post('/express/guardar', {
                //contiene los datos que corresponden al usuario
                datos: datos,
                //contene los datos necesarios para la sertificacion web
                servicio: servicios
            })
            .success(function(data) {
                console.log(data)
                deferred.resolve(data)
            })
            .error(function(err) {
                console.log(err)
                deferred.reject(err)
            })
        return deferred.promise
    }
}])

//servicio que se encarga de hacer un llamado al servidor para solicitar los servicios web para el combo box
.factory('cargarServicios', ['$http', function($http) {
        return $http.get('express/servicios')
            .success(function(res) {
                return res
            })
            .error(function(res) {
                console.log(res);
                return res;
            })

    }])
    //servicio que se encarga de hacer un llamado al servidor para que se envie la clave de validacion
    .service('clave', function($http, $q) {
        this.clave = function() {
            var deferred = $q.defer()
            return $http.post('/express/clave', {
              //contiene el id del usuario
                    idUsuario: datos.id
                })
                .success(function(res) {
                    deferred.resolve(res)
                })
                .error(function(res) {
                    deferred.reject(res)
                })
            return deferred.promise
        }
    })

//servicio que se encarga de hacer un llamado al servidor para validar la clave usada
.service('verificar', function($http, $q) {
    this.verificar = function(clave) {
        var deferred = $q.defer()
        return $http.post('/express/verificar', {
                clave: clave
            })
            .success(function(data) {
                console.log(data)
                deferred.resolve(data)
            })
            .error(function(err) {
                console.log(err)
                deferred.reject(err)
            })
        return deferred.promise
    }
})