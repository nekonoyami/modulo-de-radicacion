var express = require('express'),
    router = express.Router(),
    baseDatos = require('./sql'),
    consultaSQL = "select a.id_acto, a.nombre_acto, a.codigo, a.activo_acto, ar.Requisito, ar.id_req, ar.protocolo from actos a, actos_requisitos ar where a.codigo = ar.id_acto limit 500";
    

//activo_acto = 'SI' and

router.route('/provar').all(function(req, res) {
    console.log('rutas.js - 7 :: req', req.body);
    req.getConnection(function(err, conexion) {
        if (err) {
            console.log('rutas.js - 11::conexion', err);
            res.sendStatus(408)
        } else
            conexion.query(req.body.sentencia, function(err, resultado) {
                if (err) {
                    console.log('rutas.js - 12 :: sentencia', err);
                    res.send('error con la sentencia sql')
                } else {
                    res.send(resultado)
                }

            })
    })
})

router.route('/actos').get(function(req, res) {
    req.getConnection(function(err, conexion) {
        if (err) {
            console.log('ruta.js - 29::error', err);
            res.sendStatus(408)
        } else {
            conexion.query(consultaSQL, function(err, resultado) {
                if (err) {
                    console.log('rutas.js - 34 :: error', err);
                } else
                    res.send(resultado)
                console.log(resultado.length);
            })
        }
    })
})

router.route('/radicar').post(function(req, res) {
  console.log('rutas.js -45:: body', req.body + "\n");
  var datos = eval(req.body)
  var requisitos = eval(datos.requisitos),
      datos_usuario = JSON.parse(datos.datos_usuario),
      actos = eval(datos.actos);
  console.log('rutas.js - 49::requisitos', requisitos);
  console.log('rutas.js - 50::datos_usuario', datos_usuario);
  console.log('rutas.js - 51::actos', actos);
  
  baseDatos.sqlRequisitos(requisitos, datos_usuario, req, res)
 

    

//console.log('rutas.js -51::body1', datos1);

    //console.log('rutas.js - 46::req', req);

    //res.send(req.files)
        /*  req.getConnection(function (err, conexion) {
            if(err){
              console.log('ruta.js - 46::error', err);
              res.sendStatus(408)
            }
            else
          })*/
})

module.exports = router















