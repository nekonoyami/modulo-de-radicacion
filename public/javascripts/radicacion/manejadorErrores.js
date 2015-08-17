function revisarObligatorio(elemento) {
	if (elemento.value=="" && elemento.name =="usuario") {
        alert("Mensaje : Ingrese un usuario");
		elemento.className='error';	
	} 
    else if (elemento.value == "" && elemento.name == "contraseña"){
        elemento.className = 'error';
        
    }
    else {
		elemento.className='';	
	}
}