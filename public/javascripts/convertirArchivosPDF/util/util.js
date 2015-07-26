function verificarServicios(datos, archivo) {
    var mensaje = 'por favor seleccione un servicio para el archivo: '
    var blMensaje = false
    if (typeof datos == 'undefined') {
        return mensaje + archivo[0].nombre
    } else
        for (var i = 0; i < archivo.length; i++) {
            if (datos[i] == '' || datos[i] === 0 || typeof datos[i] == 'undefined') {
                console.log(datos[i], typeof datos[i]);
                mensaje += archivo[i].nombre + '\n'
                blMensaje = true
            }
        }
    if (blMensaje)
        return mensaje
    else
        return null
}

function verificarCopias(datos, archivo) {
    var mensaje = 'por favor digite una cantidad de copias mayor a cero para el archivo: '
    var blMensaje = false
    if (datos == 0) {
        return mensaje + archivo[0].nombre
    } else
        for (var i = 0; i < archivo.length; i++) {
            console.log(datos[i], typeof datos[i]);
            if (datos[i] == '' || typeof datos[i] == 'undefined') {
                mensaje += archivo[i].nombre + '\n'
                blMensaje = true
            }
        }
    if (blMensaje)
        return mensaje
    else
        return null
}