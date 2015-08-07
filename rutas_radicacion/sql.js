var sentencias = require('./sentencias')
//tabla control requisitos
exports.sqlRequisitos = function(requisitos, datos, req, res) {
    req.getConnection(function(err, conexion) {
        if (err) {
            console.log("sql.js - 6:: err", err);
            res.sendStatus(408)
        } else {
            conexion.query(sentencias.insertControlRequisitos(requisitos, datos), function(err, resultado) {
                if (err) {
                    console.log("sql.js - 11:: err", err);
                    res.sendStatus(500)
                }
              else{
                res.send(resultado)
              }
            })
        }

    })
}

// query para validar el acceso del usuario   
exports.validarUsuario = function (usuario , clave) {
    var query = 'select *  from usuarios where usuario='+"'"+usuario+"' && clave ='" +clave +"'";
//    var query = 'select * from usuarios';
    return query;
}
