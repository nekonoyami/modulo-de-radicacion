var app = angular.module("app", ['ngGrid', 'ui.bootstrap', 'ngSanitize'])

.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        '**'
    ]);

});

/**
 * funcion que se encarga de buscar las posisciones de un elemento con el mismo "nombre_acto" dentro de una lista
 * y retornar un array donde estan las posiciones de los elementos repetidos
 * @elemento: objeto a buscar dentro del array
 * @array: lista en la cual se encuentran los elementos repetidos
 **/
function buscarRepetidos(elemento, array) {
    var repetidos = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i] !== 'vacio') {
            if (elemento.nombre_acto == array[i].nombre_acto) {
                repetidos.push(i)
            }
        }
    }
    return repetidos
}

/**
 * funcion que resive el array que corresponde a la consulta sql que consulta los procesos de radicacion
 * retorna una un nuevo array con solo un acto el cual contiene todos los requisitos
 * necesarios
 **/
function darFormato(array) {
    var lista = array;
    var nuevoFormato = [];
    for (var i = 0; i < lista.length; i++) {
        if (lista[i] !== "vacio") {
            //console.log('app.js - 16 :: pos', i);
            //console.log('app.js - 17 :: lista', lista);
            //console.log('app.js - 18 :: lista', lista[i].nombre_acto);

            var repetidos = buscarRepetidos(lista[i], lista)
            var requisitos = [],
                nombre = '',
                id = '',
                codigo = '';
            for (var j = 0; j < repetidos.length; j++) {
                //id_actos.push(lista[repetidos[j]].id_acto)
                //console.log('app.js - 27 :: pos', repetidos[j]);
                //console.log('app.js - 28 :: lista', lista);
                nombre = lista[repetidos[j]].nombre_acto
                id = lista[repetidos[j]].id_acto
                requisitos.push(lista[repetidos[j]].Requisito)
                codigo = lista[repetidos[j]].codigo
                lista[repetidos[j]] = 'vacio'
            }


            nuevoFormato.push({
                    id_acto: id,
                    nombre_acto: nombre,
                    codigo: codigo,
                    Requisito: requisitos
                })
                /*            var nuevo = borrarRepetidos(lista, repetidos)
                            console.log(nuevo);
                            lista = nuevo*/
                /*console.log('app.js - 46 :: largo', largo);*/
        }
    }

    return nuevoFormato
}

/*function borrarRepetidos(lista, repetidos) {
    for (var i = 0; i < repetidos.length; i++) {
        if (lista[repetidos[i]] === 'vacio') {
            console.log('app.js - 57 :: borrados', lista.splice(repetidos[i], 1))
            console.log('app.js - 57 :: posicion', repetidos[i])
        }
    }
    return lista
}*/

/**
 * funcion que retorna un json que corresponde a un acto, con el siguiente formato:
 * *codigo: codigo del acto
 * *requisito: array con los requisitos que son visibles en la pagina
 * *repetidos: array con los requisitos que ya se muestran en la pagina (los requsisitos repetidos)
 * *archivo: json que contendra los archivos que se hallan cargadao a este acto (llave = requisito)
 * *comentario: json que contendra los comentarios hechos sobre un requisito de este acto
 * @seleccionados corresponde a la lista con los requisitos que ya han sido seleccionados
 * @requisistos corresponde a la lista de los requisitos que se van a verifcar si ya han sido seleccionados
 **/
function requisitosRepetidos(seleccionados, requisitos) {
    var formato = {
        codigo: seleccionados.codigo,
        requisitos: seleccionados.Requisito,
        repetidos: [],
        archivos: {},
        comentario: {}
    }
    if (requisitos.length <= 0) {
        return formato;
    } else {
        var nuevaLista = [],
            noMostrar = [];
        for (var i = 0; i < seleccionados.Requisito.length; i++) {
            if (!existe(seleccionados.Requisito[i], requisitos))
                nuevaLista.push(seleccionados.Requisito[i])
            else
                noMostrar.push(seleccionados.Requisito[i])
        }
        formato.requisitos = nuevaLista;
        formato.repetidos = noMostrar;
        return formato
    }
}

/**
 * funcion que se encarga de verificar si los requisitos estan repetidos en un lista dada
 * en cuyo caso retorna true y la posicion o false en caso contrario
 **/
function existe(elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        for (var j = 0; j < lista[i].requisitos.length; j++) {
            if (elemento === lista[i].requisitos[j])
                return true
        }
    }
    return false
}


/**
 * funcion que elimina los elementos cuando una columna de la grilla es deseleccionada
 * @saliente: json que contiene el array representa los requisitos que estan en el elemento que es deseleccionado
 * @requsisitos: array que representa todos los elementos que han sido seleccionados hasta el momento
 *               en que esta funcion es invocada
 **/

function eleminarSalientes(saliente, lista) {
    //variable que guarda la posicion del requisito y su obejeto padre
    var resultado;
    //se recorre la lista de requisitos del elemento que fue deseleccionado
    for (var i = 0; i < saliente.Requisito.length; i++) {
        if (!seMuestraRequisito(saliente.codigo, saliente.Requisito[i], lista)) {
            resultado = existeRepetido(saliente.Requisito[i], lista);
            if (resultado.boolean) {
            //se obtiene el un requisito de un elemento en su lista de repetidos y se cambia a su lista de requisitos  
               lista[resultado.posOjeto].requisitos.push(lista[resultado.posOjeto].repetidos[resultado.posRequisito])
                    //se elimina el elemento de la lista de repetidos
                lista[resultado.posOjeto].repetidos.splice(resultado.posRequisito, 1)
            }
        }
    }
    //se recorre la lista de requisitos
    for (var i = 0; i < lista.length; i++) {
      //se elimina el requisito que fue deseleccionado de la lista principal (la cual esta representada por "lista") 
        if (lista[i].codigo === saliente.codigo)
            lista.splice(i, 1)
    }
    return lista
}

function existeRepetido(elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        for (var j = 0; j < lista[i].repetidos.length; j++) {
            if (elemento === lista[i].repetidos[j])
                return {
                    boolean: true,
                    posOjeto: i,
                    posRequisito: j
                }
        }
    }
    return {
        boolean: false
    }
}


/**
 * funcion que se encarga de buscar si un requisito en espefico ya esta en la array de "requisitos" de un elemento
 * de la lista (sin tener en cuenta a el elemento de donde este proviene)
 * retornar true si encuentra uno o false en caso contrario
 * @codigo: codigo del elemento del cual proviene el requisito a buscar
 * @elemento: requisito a buscar
 * @lista: array que representa a la lista principal donde estan todos los elementos seleccionados
 **/
function seMuestraRequisito(codigo, elemento, lista) {
    for (var i = 0; i < lista.length; i++) {
        if (!(lista[i].codigo === codigo)) {
            for (var j = 0; j < lista[i].requisitos.length; j++) {
                if (elemento === lista[i].requisitos[j])
                    return true
            }
        }
    }
    return false
}