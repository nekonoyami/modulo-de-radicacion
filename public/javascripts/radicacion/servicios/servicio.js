app.service('cargarActo', function($http) {

    return $http.get('/radicacion/actos')
        .success(function(res) {
            return res
        })
        .error(function(res) {
            console.log('servicio.js - 8 :: error', res);
            alert('problemas con el servidor de la base de datos, por favor comuniquese su proveedor de servicios')
        });
})

.service('enviarRadicacion', function($http, $q) {
    this.enviarRadicacion = function(lista) {
        var deferred = $q.defer(),
            formulario = new FormData();
        formulario.append('radicacion', lista)

        return $http.post('/radicacion/radicar', formulario, {
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
                console.log('servicios.js - 30', err);
            })
        return deferred.promise;
    }

})

.service('cargarEncargados', function ($http, $q) {
  
})