function ViewNewsQuejas(){
	$("#content").load("views/quejas.html?v=1.0",function(){
		$("#table_quej2").append("<h5 class='alert alert-light table-gradient text-dark'><p class='text-dark consul text-center'>Para consultar el mensaje, dé clic en el texto del estado.Solo se evidenciaran los mensajes que no se han contestado , si desea verlos mensajes respondidos seleccione la siguiente opcion <p><div class='form-check form-switch text-center justify-content-center  d-flex align-items-center'><input class='form-check-input text-center' role='switch'  type='checkbox' onclick='checkQuejas()' id='checktod'/><label class='form-check-label text-dark text-center' for='flexSwitchCheckDefault'>Ver todos los mensajes</label> </div></h5>");
		var tipo=1;
		$("#table_quej").html(`<div id="spinner-loading2" class="spinner-loading"><span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Cargando...</div>`);
		let quejas = getquejas(tipo);
		console.log(quejas)
		$.when(quejas).done(function(responsequejas){
		

			console.log(responsequejas);
			if (responsequejas["code"] == 200) {
				let table_nmessages = createTableQ("quejas",responsequejas["response"],false, true, 1,true);
				$("#table_quej").children().remove();
				$("#table_quej").append(table_nmessages);
				openMore();
				$("tr").each(function() {
				$(this).children("td:nth-child(3)").addClass('d-none');
				$(this).children("td:nth-child(7)").addClass('d-none');
				$(this).children("td:nth-child(8)").addClass('d-none');
				$(this).children("td:nth-child(9)").addClass('d-none'); 
				$(this).children("td:nth-child(11)").addClass('d-none');
				$(this).children("td:nth-child(21)").addClass('d-none');
				$(this).children("td:nth-child(15)").addClass('d-none'); 
				$(this).children("td:nth-child(13)").addClass('text-left');
				$(this).children("td:nth-child(14)").addClass('text-left'); 
			});			
				$("#table_quej th").addClass('text-center');
			}else if(responsequejas["code"] == 400) {
				$("#table_quej").html(`<div><h5>No tienes mensajes pendientes</h5></div>`);
			}else if(responsequejas["response"]["code"] == 450){
				alert("Su sesion ha caducado por favor cierre y vuela e ingrese sus credenciales , gracias")
				location.href = "../index.html";

			}
	
		}).fail(function(resp){
			console.log(resp);
		});
	});

	$('.modal-backdrop').remove(); 
}

function checkQuejas() {
	check = document.getElementById("checktod");
	if (check.checked) {
		let quejas = getquejas(2);
		$("#table_quej").html(`<div id="spinner-loading2" class="spinner-loading"><span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Cargando...</div>`);
		$.when(quejas).done(function(responsequejas){
			if (responsequejas["code"] == 200) {
				let table_nmessages = createTableQ("quejas",responsequejas["response"],false, true, 1,true);
				$("#table_quej").children().remove();
				$("#table_quej").append(table_nmessages);
				openMore();
				 $("tr").each(function() {
					$(this).children("td:nth-child(2)").addClass('d-none');
					$(this).children("td:nth-child(4)").addClass('d-none');
					$(this).children("td:nth-child(5)").addClass('d-none');
					$(this).children("td:nth-child(6)").addClass('d-none');
					$(this).children("td:nth-child(7)").addClass('d-none');
					$(this).children("td:nth-child(9)").addClass('d-none');
					$(this).children("td:nth-child(25)").addClass('d-none');
				});			
				$("#table_quej th").addClass('text-center');
			}else if(responsequejas["code"] == 400) {
				$("#table_quej").html(`<div><h5>No tienes mensajes pendientes</h5></div>`);
			}else if(responsequejas["response"]["code"] == 450){
				alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias")
				location.href = "../index.html";
			}
		}).fail(function(resp){
			console.log(resp);
		});
	}
	else {
		ViewNewsQuejas()
	}
}

function createTableQ(id,array_,sections=false){
	var th = (sections)?"SECCIÓN":"#"
    var table = "<table class = 'table table-striped' id='table_"+id+"' style='font-size:12px;'><thead class='thead-active text-center table-light table-gradient text-dark'><tr><th>"+th+"</th>";
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
            var dataTr = (sections)?sections_array[cont]:cont;
			var estado_m = value['Estado'];
			var estado_D = value['EstadoDest'];
			var tipojust = value['Justificado'];
            clase = "";
			style = "vertical-align: middle;";
            table = table +"<tr id='fila-"+data+"'><td class='number_' style='"+style+"'>"+dataTr+"</td>";
			
			
			$.each(value,function(key_,value_){
				clase = "";
				var text = "";
				if(key_ == 'Redirigir' ){
					if(estado_m =="ENVIADO" ||  estado_m =="CONSULTADO" || estado_m == "CONSULTADO REDIRECCIÓN"){
						text = btnReassingHtml(value_,data,'queja');
						value_="";
					}
				}else if(key_ == 'Estado'){
					clase = colorState(value_)
					text = btnUpdateState(value_, data, estado_D, tipojust, "QUEJA");
					value_ = "";
				}else {
					text = truncateText(value_,40);
				}
				table = (key_ != 'DATA_VAL')? table+"<td class = 'short-text celValue "+clase+"' data-val='"+data+"' data-item='"+key_+"' style='"+style+"'  data-fulltext='" + value_ + "'>"+text+"</td>":table ;
				clase = "";
			})


			table = table + "</tr>";
			cont +=1;
		}
	});


	var table = table+"</tbody></table>";
    return table;



}

function fillTableQuejas(object){
    var text = [];
    //console.log(object);
    $.each($(object),function(){
        text=$(this).text();
		var val_not = $(this).attr('data-val');
		var num = $("[data-val='"+val_not+"'][data-item='NumMensaje']").text();
        if ($(object).attr('data-item') == "Estado") {
	        if(text.length == 0 || text=='1' ||text== 1){
				var val_not = $(this).attr('data-val');
				var num = $("[data-val='"+val_not+"'][data-item='NumMensaje']").text();
				sendMessage(parseInt(num)).done(function(response){
					console.log(response);
				}).fail(function(response){
					console.log(response);
				});
				ViewNewsQuejas();
			}
			else if(text==2||text=='2'){
			
				var buttonFail = "<div><button type='button' onclick='modalMessaQuej("+num+")'   id='btnEstado' class='btn btn '><i class='fa fa-eye fa-sm' aria-hidden='true' ></i> Pendiente por <br/> Responder</button></div>";
	            $(this).addClass('table-warning');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);
			}
			else if(text==3||text=='3'){
				var buttonFail = "<div><button type='button' onclick='modalMessaQuej("+num+")'   id='btnEstado' class='btn btn '><i class='fa fa-eye fa-sm' aria-hidden='true' ></i> Tramite</button></div>";
	            $(this).addClass('table-info');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);
			
			}
	        else if(text==4||text=='4'){
	        	var val_not = $(this).attr('data-val');
	        	var date_close_ = $("[data-val='"+val_not+"'][data-item='fechaLimite']").text().split("-");
	        	var date_consult_ = $("[data-val='"+val_not+"'][data-item='FechaEnvio']").text().split("/");
	        	var date_close = new Date(date_close_[0], date_close_[1],date_close_[2])
	        	var date_consult = new Date(date_consult_[2], date_consult_[1],date_consult_[0])
	        	if (date_close < date_consult) {
	        		var buttonOk = "<div   class=''><i class='fa fa-check-circle fa-sm' aria-hidden='true' ></i> Consultada Fuera de Tiempo </div>";
		            $(this).addClass('table-info');   
		            $(this).attr('data-state',$(this).text());
		            $(this).text("");
		            $(this).append(buttonOk);
	        	}
	        	else if (date_close >= date_consult) {
		            var buttonOk = "<div class=''><i class='fa fa-check-circle fa-sm' aria-hidden='true' ></i> Respondida </div>";
		            $(this).addClass('table-success');   
		            $(this).attr('data-state',$(this).text());
		            $(this).text("");
		            $(this).append(buttonOk);
	        	}
	        } 
			else if(text==5||text=='5'){
			
				var buttonFail = "<div ><i class='fa fa-check-circle fa-sm' aria-hidden='true' ></i> Redirigido </div>";
	            $(this).addClass('table-success');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);
			}
			else if(text==6||text=='6'){
			
				var buttonFail = "<div ><i class='fa fa-check-circle fa-sm' aria-hidden='true' ></i> Redireccionado </div>";
	            $(this).addClass('table-success');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);
				
			}else if(text==7||text=='7'){
			
				var buttonFail = "<div ><i class='fa fa-check-circle fa-sm' aria-hidden='true' ></i> Cerrrado </div>";
	            $(this).addClass('table-success');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);
			}
			else if(text==8||text=='8'){
			
				var buttonFail = "<div><button type='button' onclick='modalVistMessa("+num+")'   id='btnEstado' class='btn btn '><i class='fa fa-eye fa-sm' aria-hidden='true' ></i> Pendiente por <br/> Responder</button></div>";
	            $(this).addClass('table-warning');
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);

			
			}
        }else if($(object).attr('data-item') == "Actualizar"){
			var num = $("[data-val='"+val_not+"'][data-item='NumMensaje']").text();
			var estado = $("[data-val='"+val_not+"'][data-item='Justificado']").text();
			 if(estado == "Justificada" && (text ==0 || text =="--"  )){
				var buttonFail = "<div><button type='button' onclick='modalQuejas("+num+")'   id='btnEstado' class='btn btn '> <i class='fa fa-refresh' aria-hidden='true'></i></button></div>";
	            $(this).attr('data-state',$(this).text());
	            $(this).text("");
	            $(this).append(buttonFail);

			}
		}
		else if ($(object).attr('data-item') == "Redirigir"){
			var val_not = $(this).attr('data-val');
			var num = $("[data-val='"+val_not+"'][data-item='NumMensaje']").text();
			var estado = $("[data-val='"+val_not+"'][data-item='EstadoDest']").text();
			if(estado==1 || estado==2){		
			var inputMotivo = `<div  class='input-group mb-2 text-center'><button  onclick=validationReassing('${num}','queja') data-toggle="modal" class="btn btn-danger"  ><i class="fa-solid fa-user-large-slash" aria-hidden="true"></i></button></textarea></div>`;
			$(this).attr('data-state',$(this).text());
			$(this).text("");
			$(this).append(inputMotivo);
			}
			
		}
    });
	

}

function redirrecionarQuejas(num,motivo){
	let actionEntry= redirigir(num,motivo);
	$("#brnRedirigir").html(
		"Actualizando   <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>"
	);
	$("#brnRedirigir").attr("disabled", true);
        
	$.when(actionEntry).done(function(response) {	 

		if(response["response"]["code"] == 450){
			alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias")
			location.href = "../index.html";
			
		}
		if (response["code"] == 200 && response["response"][0] == true) {
			$("#ModalLargeObs").modal("hide");
			mensaje = "Quedo registrada la respuesta a su mensaje. Gracias"
			cargartoast("Ejecución",mensaje)
		
		} 
		{
			$("#ModalLargeObs").modal("hide");
			var code_resp = 500;
		}
	
	//
	})
	$(".labelInvalid").each(function () {
		$(this).removeClass("labelInvalid");
		$(this).removeClass("animated infinite pulse");
	});

}

function modalQuejas(message){
	console.log(message);
	$("#bodyTagLarge").load("views/adminView/modalQuejasUpdate.html?v=1.0",function(){
		$("#titleModalLarge").text("Actualizacion de Datos");
		$("#titleModalLarge").css('text-align', 'center');
		cargueMotivo();
		$("#lbmensage").text("");
		$("#lbstudent").text("");
		$("#btnModalLarge").off();
		$("#btnModalLarge").removeAttr('disabled');
		$("#btnModalLarge").removeClass('d-none');
		$("#btnModalLarge").text("Actualizar");
		$("#btnModalLarge").click(function (e) {
			var actionEntry1 = "";
			var motivo_queja = document.getElementById("selectMotivo").value;
			var txtComentPadres = $("#txtComentPadres").val();
			var txtComentAlumnos = $("#txtComentAlumnos").val();
			var txtPlanAccion = $("#txtPlanAccion").val();
			var fecha_limite =  $("#fecha_limite").val() == "" ? "" : new Date($("#fecha_limite").val());
			var texto ="";
			var campo ="";
			if (motivo_queja!="Seleccionar"){	
				texto =motivo_queja;
				campo= "motivo_queja";
				actionEntry1=update_Queja(campo,texto,message);
			}
			if (txtComentPadres!=""){	
				texto =txtComentPadres;
				campo= "comentr_padre";
				actionEntry1=update_Queja(campo,texto,message);
			}
			if (txtComentAlumnos!=""){	
				texto =txtComentAlumnos;
				campo= "comentr_alumn";
				actionEntry1=update_Queja(campo,texto,message);
			}
			if (txtPlanAccion!=""){	
				texto =txtPlanAccion;
				campo= "plan";
				actionEntry1=update_Queja(campo,texto,message);
			}
			if (fecha_limite!="" ){	
				fecha_limite.setDate(fecha_limite.getDate() + 1);
				
				texto = fecha_limite.toISOString().split('T')[0] +' 23:59:00';
				campo = "fecha_limite";
				console.log(fecha_limite.toLocaleDateString())
				actionEntry1=update_Queja(campo,texto,message);
			}
			$("#btnModalLarge").html("Guardando   <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>");
			$("#btnModalLarge").attr("disabled", true);
			$.when(actionEntry1).done(function (response) {	 
				var comentalumno =  response["response"][0]["comentarios_alumno"];
				var comentapadre =  response["response"][0]["comentarios_padre"];
				var fecha_limite =  response["response"][0]["fecha_limite"];
				var motivo =  response["response"][0]["motivo_queja"];
				var plan =  response["response"][0]["plan_accion"];
				var mensaje  = response["response"][0]["cod_mensaje"];
				var codigo =btoa(mensaje)

				var fila = document.getElementById('fila-'+codigo+'')
				fila.querySelector('td[data-item="comentr_padre"]').textContent=comentapadre
				fila.querySelector('td[data-item="comentr_alumn"]').textContent=comentalumno
				fila.querySelector('td[data-item="plan"]').textContent=plan
				fila.querySelector('td[data-item="fecha_limite"]').textContent=fecha_limite
				fila.querySelector('td[data-item="motivo"]').textContent=motivo
				$("#ModalLargeObs").modal("hide");
				if(response["response"]["code"] == 450){
					alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias")
					location.href = "../index.html";
				}
				if (response["code"] == 200 && response["response"][0] == true) {
					$("#ModalLargeObs").modal("hide");
				} else if (response["code"] == 200 && response["response"][0] == false) {
					$("#ModalLargeObs").modal("hide");
				}
			}).fail(function (response) {
				console.log("fail Entry");
				console.log(response);
			});
			
			$(".labelInvalid").each(function () {
				$(this).removeClass("labelInvalid");
				$(this).removeClass("animated infinite pulse");
			});
			e.preventDefault();
		});
	
		$("#ModalLargeObs").off("hidden.bs.modal");
	$("#ModalLargeObs").modal("show");
	
	});
}

function cargueMotivo(){
	var getMotivo = get_motivo();
	console.log(getMotivo)
	var selecMotiv = "";
     $.when(getMotivo).done(function(listMotivo){
		if(listMotivo["response"]["code"] == 450){
			alert("Su sesion ha caducado por favor cierre y vuela e ingrese , gracias")
			location.href = "../index.html";
			
		}
		var dato = listMotivo["response"][0]["transporte"]==1?"":"disabled" 
			
		selecMotiv += "<select id='selectMotivo' class='form-select '  aria-label='Default select example' ><option selected>Seleccionar</option>";
		for (var i=0 ; i < listMotivo["response"]["length"];i++ ){
			selecMotiv += "<option value='"+listMotivo["response"][i]["id_motivo"]+"'>"+listMotivo["response"][i]["motivo"]+"</option>";
		}
		$("#selecMotiv").append(selecMotiv);
	}).fail(function(res){
		console.log(res);
	})
}

function modalMessaQuej(Message){
	console.log(Message)
	let content = getQuejaContent(Message);
	console.log(content);
	$.when(content).done(function(responseCont){
		console.log(responseCont["response"][0]);
		openModal(responseCont["response"][0],'quejas');
	}).fail(function(responseCont){
		console.log(responseCont);
	});
}