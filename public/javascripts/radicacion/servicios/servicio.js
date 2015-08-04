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
    this.enviarRadicacion = function(requisitos, actos, archivos) {
        var deferred = $q.defer(),
            formulario = new FormData();
        //formulario.append('requisitos', requisitos)
        //formulario.append('actos', actos)
        //formulario.append('archivo', archivos)
        console.log('formulario', formulario.file);
        return $http({
                method: 'post',
                url: '/radicacion/radicar',
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: function(data) {
                    formulario.append('requisitos', angular.toJson(data.requisitos))
                    formulario.append('actos', angular.toJson(data.actos))
                    formulario.append('datos_usuario', angular.toJson(datos_usuario))
                    console.log('archvios', data.archivos);
                    for (var i = 0; i < data.archivos.length; i++) {
                        formulario.append("file"+i, data.archivos[i])
                    }
                    return formulario
                },
                data: {
                    requisitos: requisitos,
                    actos: actos,
                    archivos: archivos
                }
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

.service('cargarEncargados', function($http, $q) {

})

/*'/radicacion/radicar', envio, {
    headers: {
        'Content-type': false
    },
    transformRequest: function(envio) {
        formulario.append('requisitos', angular.toJson(envio.requisitos))
        formulario.append('actos', angular.toJson(envio.actos))
        for (var i = 0; i < envio.archivos.length; i++) {
            formulario.append('file' + i, envio.archivos[i])
        }
        return formulario
    },
    envio: {
        requisitos: requisitos,
        actos: actos,
        archivos: archivos
    }

}*/

