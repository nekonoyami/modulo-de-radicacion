exports.conexion = function(req) {
  var conection;
    req.getConnection(function(err, conexion) {
        if (err) {
            console.log(err);
        } else
          console.log('conexion.js - 7', conexion);
            conection = conexion;
    })
    return conection
}