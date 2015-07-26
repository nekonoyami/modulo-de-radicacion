var express = require('express'),
    router = express.Router(),
    consultaSQL = "select a.id_acto, a.nombre_acto, a.codigo, ar.Requisito from actos a, actos_requisitos ar where activo_acto = 'SI' and a.codigo = ar.id_acto limit 500";



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
            console.log('ruta.js - 28::error', err);
            res.sendStatus(408)
        } else {
            conexion.query(consultaSQL, function(err, resultado) {
                if (err) {
                    console.log('rutas.js - 32 :: error', err);
                } else
                    res.send(resultado)
                console.log(resultado.length);
            })
        }
    })
})

module.exports = router