/*    var bPreguntar = true;

window.onbeforeunload = preguntarAntesDeSalir;

function preguntarAntesDeSalir() {
    if (bPreguntar)
        return "¿Seguro que quieres salir?";
}*/
var div = null
var datos = null;
var mensaje = '';
var app = angular.module('app', ['ngSanitize', 'ui.bootstrap'])

.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        '**'
    ]);

});

