function ViewNewsMessag(){
	$("#content").load("views/mensajes.html?v=1.0",async function (){
		try {
			$("#table_titulo").append(`<h5 class='card-header tittleIcon d-flex justify-content-between align-items-center text-white'>Para consultar el mensaje, dé clic en el texto del estado.Solo se evidenciaran los mensajes que no se han contestado , si desea verlos mensajes respondidos seleccione la siguiente opción</h5>
				<div class='form-check form-switch text-center justify-content-center  d-flex align-items-center'>
					<input class='form-check-input text-center' type='checkbox' role='switch' onclick='checkMessag()' id='checktod' />
					<label class='form-check-label text-center text-white' for='flexSwitchCheckDefault'>Ver todos los mensajes</label> 
				</div>
				`);
			$("#table_circ").children().remove();
			let table_nmessages="" ;
			$("#table_mensaje").html(`<div id="spinner-loading2" class="spinner-loading"><span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Cargando...</div>`);
			let responseMessage = await getMessage('1');
			 
			if (responseMessage["code"] == 200) {
				table_nmessages = createTable1("mensajes",responseMessage["response"],false, true, 1,true);
				$("#table_mensaje").children().remove();	
				$("#table_mensaje").append(table_nmessages);
				openMore();
				 $("tr").each(function() {
					$(this).children("td:nth-child(3)").addClass('d-none');
				    $(this).children("td:nth-child(5)").addClass('text-left');
					$(this).children("td:nth-child(7)").addClass('d-none');
				    $(this).children("td:nth-child(8)").addClass('d-none');
					$(this).children("td:nth-child(16)").addClass('d-none');
				    $(this).children("td:nth-child(17)").addClass('d-none'); 
				}); 
				$("#table_mensaje").addClass('text-center table-responsive');	
			}else if(responseMessage["code"] == 400) {
				$("#table_mensaje").html(`<div><h5>No tienes mensajes pendientes</h5></div>`);
			}
			else if(responseMessage["response"]["code"] == 450){
				alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias");
				location.href = "../index.html";
			}
		} catch (error) {
			console.error(error);
		}
	})
};

function updaterespuesta(){
	let validarresp = getverrespues()
	$.when(validarresp).done(function(getvalidarresp){
		console.log(getvalidarresp)
	}).fail(function(resp){
		console.log(resp);
	});
		
}

function checkMessag() {
	var tipo="";
	check = document.getElementById("checktod");
	if (check.checked) {
		tipo="2";
	}
	else {
		tipo="1";
	}
	let message = getMessage(tipo);
	$("#table_mensaje").html(`<div id="spinner-loading2" class="spinner-loading"><span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Cargando...</div>`);
	
	$.when(message).done(function(responseMessage){
		$("#table_mensaje").children().remove();	
		console.log(responseMessage);
		if (responseMessage["code"] == 200) {
		 	let table_nmessages = "";	
			table_nmessages = createTable1("mensajes",responseMessage["response"],false, true, 1,true);
			$("#table_mensaje").children().remove();
			$("#table_mensaje").append(table_nmessages);
			openMore();
			$("tr").each(function() {
				$(this).children("td:nth-child(3)").addClass('d-none');
				$(this).children("td:nth-child(5)").addClass('text-left');
				$(this).children("td:nth-child(7)").addClass('d-none');
				$(this).children("td:nth-child(8)").addClass('d-none');
				$(this).children("td:nth-child(16)").addClass('d-none');
				$(this).children("td:nth-child(17)").addClass('d-none'); 
			}); 
			$("#table_mensaje").addClass('text-center table-responsive'); 
		}else if(responseMessage["code"] == 400) {
			$("#table_mensaje").html(`<div><h5>No tienes mensajes pendientes</h5></div>`);
		}
		else if(responseMessage["response"]["code"] == 450){
			alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias");
			location.href = "../index.html";
		}


	}).fail(function(resp){
		console.log(resp);
	});
}

function createTable1(id,array_,sections=false){

	var th = (sections)?"SECCIÓN":"#"
    var table = "<table class = 'table table-striped' id='table_"+id+"' style='font-size:12px; --mdb-bg-opacity: 0.5;'><thead class='thead-active text-center table-light table-gradient text-dark'><tr><th>"+th+"</th>";
	var cont = 1;
	var clase = ""
    var style = "white-space: preline; ";
	$.each(array_['keys'],function(index,value){
        table = table + "<th id='title"+index+"'>"+value+"</th>";
    });
	table = table+ "</tr></thead><tbody>"
	$.each(array_,function(key,value){
		if(key != 'keys'){
			var data = (typeof(value['DATA_VAL'])!=='undefined')?btoa(value['DATA_VAL']):btoa(key);
			var estado_m = value['Estado'];
			var estado_D = value['estadoDest'];
            var dataTr = (sections)?sections_array[cont]:cont;
            clase = "";
			style = "vertical-align: middle";
            table = table +"<tr id='fila-"+data+"'><td class='number_' style='"+style+"'>"+dataTr+"</td>";
			$.each(value,function(key_,value_){
				var text = "";
				if(key_ == 'Redirigir' ){
					if(estado_m ==1 ||  estado_m ==2 || estado_m == 8){
						text = btnReassingHtml(value_,data,'MENSAJE');
						value_="";
					}
				}else if(key_ == 'Estado_Mensaje'){
					clase =  colorState(value_);
					text = btnUpdateState(value_, data, estado_D, "", "mensaje");
					value_="";
				}else {
					text = truncateText(value_,40);
				}
				table = (key_ != 'DATA_VAL')? table+"<td class = 'short-text celValue "+clase+"' data-val='"+data+"' data-item='"+key_+"' style='"+style+"' data-fulltext='" + value_ + "' >"+text+"</td>":table ;
				clase = "";
			})
			table = table + "</tr>";
            cont +=1;
		}

	})
	var table = table+"</tbody></table>";
    return table;

}

function btnReassingHtml(object,id,type){
	var style ='" position: relative; padding: 15px 10px 30px 10px;"';
	var buttonredirigir ="<div class='text-center' id='div"+id+"' style='"+style+"'>";
	var codigo = atob(id)
	if(object =="--"){
		buttonredirigir += `<button id='brnRedirigir' onclick=validationReassing('${codigo}','${type}') data-toggle='modal'  class='btn btn-danger'  ><i class='fa-solid fa-user-xmark' aria-hidden='true'></i></button>`
	}
	buttonredirigir += "</div>"
	return buttonredirigir;
}

function colorState(object){
	var clases = "";
	if(object=="Enviado" ){
		clases = ""
	}else if (object=="CONSULTADO" ){
		clases = "bg-warning p-2 text-dark bg-opacity-25"
	}else if(object=="EN TRAMITE" ){
		clases = "bg-info p-2 text-dark bg-opacity-25"
	}else if(object=="TRAMITADO" ){
		clases = "bg-success p-2 text-dark bg-opacity-25"
	}else if(object=="REDIRIGIDO" ){
		clases = "bg-danger p-2 text-dark bg-opacity-25"
	}else if(object=="REDIRECCIONADO" ){
		clases = "bg-info  p-2 text-dark bg-opacity-25"
	}
	return clases;
}

//FUNCION QUE TRAE LOS DATOS DEL MENSAJE 
function modalVistMessage(Message){
	console.log(Message)
	let content = getContentMensaje(Message);
	console.log(content);
	$.when(content).done(function(responseCont){
		console.log(responseCont["response"][0]);
		openModal(responseCont["response"][0],'mensajes');

	}).fail(function(responseCont){
		console.log(responseCont);
	});
}

function cargartoast(titulo,mensaje){
	const toast = document.getElementById('liveToast')
	let tituloToast= document.getElementById('titulotoast')
	let icono= document.getElementById('icono')
	let header= document.getElementById('header')
	let mensajeToast= document.getElementById('mensajetoast')
	if (titulo="Validacion"){
		header.className="toast-header p-3 mb-2 bg-dark text-white";
		icono.className="fa-solid fa-triangle-exclamation";
	}else if(titulo="Error"){
		header.className="toast-header p-3 mb-2 bg-danger text-white"
		icono.className="fa-solid fa-circle-x";
	}else if(titulo="Ejecución"){
		header.className="toast-header p-3 mb-2 bg-success text-white"
		icono.className="fa-solid fa-circle-check";
	}
	tituloToast.innerHTML=titulo
	mensajeToast.innerHTML=mensaje
	const toastclick = new bootstrap.Toast(toast)
	toastclick.show()
}