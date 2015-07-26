BrowserDetect.init();

var sistemaOperativo = BrowserDetect.OS,
    explorador = BrowserDetect.browser,
    version = BrowserDetect.version;

function horaActual() {
  var hoy = new Date(),
    fecha = hoy.getFullYear() + '/' + hoy.getMonth() + '/' + hoy.getDay(),
        //hora actual del servidor (HH:mm)
    hora = ((hoy.getHours() < 10) ? '0' + hoy.getHours() : hoy.getHours()) + ":" + ((hoy.getMinutes() < 10) ? '0' + hoy.getMinutes() : hoy.getMinutes())
  return fecha;
}

var datos = {fechaInicio: horaActual(), OS: sistemaOperativo, browser: explorador, id: ''};