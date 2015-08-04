exports.insertControlRequisitos = function(requisitos, datos) {
    var sentencia = "insert into control_requisitos (id_req, protocolo, no_tramite, requisito, observacion, fecha, hora, quien, ok) values ",
        fecha = datos.fechaInicio,
        hora = datos.horaInicio,
        values = '';
        console.log('sentencias.js -6', fecha);
        console.log('sentencias.js -7', hora);
    for (var i = 0; i < requisitos.length; i++) {
        var id_req = requisitos[i].id,
            protocolo = requisitos[i].protocolo,
            no_tramite = 1,
            requisito = requisitos[i].requisito,
            observacion = requisitos[i].comentario,
            quien = null,
            ok = (requisitos[i].comentario === 'N/A' ? 'NO' : 'SI'),
            coma = (i == requisitos.length - 1 ? "" : ",");
        values += "('" + id_req + "','" + protocolo + "','" + no_tramite + "','" + requisito + "','" + observacion + "','" + fecha + "','" + hora + "','" + quien + "','" + ok + "')" + coma
    }  
  return sentencia + values;
}




