function ViewsnewsTracingMessage(){
	$("#content").load("views/traicingMessages.html?v=1.0",function(){
		
		$("#tableContent").children().remove();
		$("#btnGenerate").removeAttr('disabled');
        $("#btnGenerate").off("click");
        $("#btnGenerate").click(function(e){
			var chekJefe = $("#chekJefe").val();
			var chekDocente = $("#chekDocente").val();
			var chekDirector = $("#chekDirector").val();
			var chekCord = $("#chekCord").val();
			var chekPsico = $("#chekPsico").val();
			var selector = $("#selecTipo").val();
            var dateTraicingIni = new Date($("#dateTraicingIni").val()) ;
			var dateTraicingFin =  new Date($("#dateTraicingFin").val()); 
			console.log($("#dateReportIni").val());
			console.log(dateTraicingIni);
			console.log();		
			var fechainicial ="";
			var fechafinal ="";

			
			var mensaje  = "";
			if(selector == ""){
				mensaje = "Por favor seleccione la consulta "
				cargartoast("Validacion",mensaje)
			}else if($("#dateTraicingIni").val() == "" || $("#dateTraicingFin").val() == ""){
				mensaje = "Por favor escoga la fecha  que desea"
				cargartoast("Validacion",mensaje)
			}else if((chekJefe == "" || chekDocente == "" || chekDirector == "" || chekCord == "" || chekPsico == "")  ){
				mensaje = "Por favor escoga el filtro que desea"
				cargartoast("Validacion",mensaje)
			}else{

				fechainicial =  dateTraicingIni.toISOString();
				fechafinal =    dateTraicingFin.toISOString();
				var selected = new Array();    
				$('input[type=checkbox]:checked').each(function(){
						selected.push($(this).val());
						
				}); 

				var chekDirector1 = document.getElementById('chekDirector').checked;
					if(chekDirector1){
						selected.push("DT")
					}

				if (selected.length === 0) {
					mensaje = "Debes seleccionar al menos una opción "
					cargartoast("Validacion",mensaje)
		
					return false;
				}
				else
				{
					if(selector=="mensajes"){
						consultMessage(fechainicial,fechafinal,selected);	
						$("#btnSubmit").removeAttr('disabled');
					}else if (selector=="quejas"){
						consultQuejas(fechainicial,fechafinal,selected);	
					}
				}

			}e.preventDefault();
        }); 
	});
} 

function consultMessage(fechainicial,fechafinal,selected){
	console.log(fechainicial,fechafinal,selected)

	
	var mensaje ="";
   
    if (fechainicial > fechafinal) {
			console.log("Date Error1");
			mensaje = "Ingrese una fecha inferior a la fecha final "
			cargartoast("Error",mensaje)
			return
    }

	var messages = gettraicingMessage(fechainicial,fechafinal,selected,1,'',0)
		console.log(messages);
		$.when(messages).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

					
				var  tableMessaf = "<table border='1' id='tbMesaage'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += "id='table_message' style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Curso</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Mensaje</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatario</th>";
				tableMessaf += "</tr></thead><tbody id='tablemess'>"; 
				for(var i= 0; i<list['response']["length"];i++){
				tableMessaf += "<tr>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["Respuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["EstadoDestinatario"]+"</td>";
				tableMessaf += "</tr>";
				}
				tableMessaf +="</tbody></table>";
					
					$("#tableContent").append(tableMessaf);
					$("#btnSubmit").removeClass('disabled');	
			}else if(list["code"] == 400) {

				var mensaje = "No se registraron mensajes"
					cargartoast("Validacion",mensaje)
					$("#btnSubmit").addClass('disabled');
					$("#tableContent").empty ();
					
						
			}else{
				var mensaje1 = "Error por favor volver a cargar"
					cargartoast("Consulta",mensaje1)
					$("#btnSubmit").addClass('disabled');
				
			}
				
		}).fail(function(response){
			console.log(response);
		});
		
		$("#contentReport").removeClass("d-none");	
}
function consultQuejas_jef1(fechainicial,fechafinal,selected){
	console.log(fechainicial,fechafinal,selected)
	var quejas ="";
		quejas = gettraicingMessage(fechainicial,fechafinal,selected,2,'',0)
		console.log(quejas);

		$.when(quejas).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

					
				var  tableMessaf = "<table border='1' id='tbMesaage'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += "id='table_message' style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario, </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Queja</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatari</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>ENVIO</th>";
				tableMessaf += "</tr></thead><tbody id='tablequej'>"; 

				for(var i= 0; i<list['response']["length"];i++){
					tableMessaf += "<tr>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["Respuesta"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["EstadoDestinatario"]+"</td>";
					tableMessaf += "</tr>";
					}
					tableMessaf +="</tbody></table>";
						
						$("#tableContent").append(tableMessaf);
						$("#btnSubmit").removeClass('disabled');
				}else if(list["code"] == 400) {

					var mensaje = "No se registraron mensajes"
						cargartoast("Validacion",mensaje)
						$("#btnSubmit").addClass('disabled');
						$("#tableContent").empty ();
						
							
				}else{
					var mensaje1 = "Error por favor volver a cargar"
						cargartoast("Consulta",mensaje1)
						$("#btnSubmit").addClass('disabled');
					
				}
			})
}

function consultMessage_Jef(fechainicial,fechafinal,selected,secciones,satisfacc){
	console.log(fechainicial,fechafinal,selected)

	
	var mensaje ="";
	var nivel =0;
    if (fechainicial > fechafinal) {
			console.log("Date Error1");
			mensaje = "Ingrese una fecha inferior a la fecha final "
			cargartoast("Error",mensaje)
			return
    }
	if (satisfacc==true){
		nivel=1;
	}

	var messages = gettraicingMessage(fechainicial,fechafinal,selected,5,secciones,nivel)
		console.log(messages);
		$.when(messages).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

					
				var  tableMessaf = "<table border='1' id='tbMesaage'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += "id='table_message' style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Curso</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Mensaje</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatario</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Nivel Satisfacción</th>";
				tableMessaf += "</tr></thead><tbody id='tablemess'>"; 
				for(var i= 0; i<list['response']["length"];i++){
				tableMessaf += "<tr>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["Respuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["EstadoDestinatario"]+"</td>";
				let  content= "";

				if(list['response'][i]["nivelsatisfaccion"]=="Exelente"){
					content= '<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-laugh fa-xl" style="color:#098b29"></i> E</label></div>';
				}else if(list['response'][i]["nivelsatisfaccion"]=="Bien"){
					content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-smile fa-xl" style="color:#ffde38"></i>B</label></div>'
				}else if(list['response'][i]["nivelsatisfaccion"]=="Regular"){
					content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-meh fa-xl" style="color:#ee8917"></i>R</label></div>'
				}else if (list['response'][i]["nivelsatisfaccion"]=="Malo"){
					content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-frown fa-xl" style="color:#d71919"></i>M</label></div>'
				}else{
					content=list['response'][i]["nivelsatisfaccion"]
				}

				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+content+"</td>";
				tableMessaf += "</tr>";
				}
				tableMessaf +="</tbody></table>";
					
					$("#tableContent").append(tableMessaf);
					$("#btnSubmit").removeClass('disabled');	
			}else if(list["code"] == 400) {

				var mensaje = "No se registraron mensajes"
					cargartoast("Validacion",mensaje)
					$("#btnSubmit").addClass('disabled');
					$("#tableContent").empty ();
					
						
			}else{
				var mensaje1 = "Error por favor volver a cargar"
					cargartoast("Consulta",mensaje1)
					$("#btnSubmit").addClass('disabled');
				
			}
				
		}).fail(function(response){
			console.log(response);
		});
		
		$("#contentReport").removeClass("d-none");	
}
function consultQuejas_jef(fechainicial,fechafinal,selected,secciones,satisfacc){
	console.log(fechainicial,fechafinal,selected)
	var quejas ="";
	var nivel =0;
	if (satisfacc==true){
		nivel=1;
	}
		quejas = gettraicingMessage(fechainicial,fechafinal,selected,6,secciones,nivel)
		console.log(quejas);

		$.when(quejas).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

					
				var  tableMessaf = "<table border='1' id='tbMesaage'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += "id='table_message' style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario, </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Curso</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Queja</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatari</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Nivel Satisfacción</th>";

				tableMessaf += "</tr></thead><tbody id='tablequej'>"; 

				for(var i= 0; i<list['response']["length"];i++){
					tableMessaf += "<tr>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["Respuesta"]+"</td>";
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+list['response'][i]["EstadoDestinatario"]+"</td>";
					
					let  content= "";

					if(list['response'][i]["nivelsatisfaccion"]=="Exelente"){
						content= '<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-laugh fa-xl" style="color:#098b29"></i> E</label></div>';
					}else if(list['response'][i]["nivelsatisfaccion"]=="Bien"){
						content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-smile fa-xl" style="color:#ffde38"></i>B</label></div>'
					}else if(list['response'][i]["nivelsatisfaccion"]=="Regular"){
						content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-meh fa-xl" style="color:#ee8917"></i>R</label></div>'
					}else if (list['response'][i]["nivelsatisfaccion"]=="Malo"){
						content='<div ><label class="form-check-label" for="sati_exel"><i class="fa-solid fa-face-frown fa-xl" style="color:#d71919"></i>M</label></div>'
					}else{
						content=list['response'][i]["nivelsatisfaccion"]
					}
	
					tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div''>"+content+"</td>";
					tableMessaf += "</tr>";
					}
					tableMessaf +="</tbody></table>";
						
						$("#tableContent").append(tableMessaf);
						$("#btnSubmit").removeClass('disabled');
				}else if(list["code"] == 400) {

					var mensaje = "No se registraron mensajes"
						cargartoast("Validacion",mensaje)
						$("#btnSubmit").addClass('disabled');
						$("#tableContent").empty ();
						
							
				}else{
					var mensaje1 = "Error por favor volver a cargar"
						cargartoast("Consulta",mensaje1)
						$("#btnSubmit").addClass('disabled');
					
				}
			}).fail(function(response){
				console.log(response);
			});
			$("#contentReport").removeClass("d-none");	
}


function ViewsTracingMessageTransport(){
	$("#content").load("views/traicingMessTransp.html?v=1.0",function(){

		var tableCoord = "";

		let listCoord = getCoordinator();
		
		console.log(listCoord);
		$.when(listCoord).done(function(list){
			console.log(list);		
			tableCoord = "<table class='table table-bordered' id='tblCoordi'><thead><tr style='height: 18px;'><th  style='width: 100%; height: 18px;' colspan="+list['response']["length"]+">Seleccione la Coordinadora a realizar seguimiento</th></tr>";
			tableCoord += "<tr style='height: 18px;'>";
			for(var i= 0; i<list['response']["length"];i++){
				//cabecera 
			tableCoord += "<th style='width: 14.1455%; height: 18px; text-align: center;'><div>"+list['response'][i]["names"]+"</div></th >";
			}
			tableCoord += "</tr>";
			tableCoord +="</thead><tbody>"
			tableCoord += "<tr style='height: 18px;'>";
			for(var i= 0; i<list['response']["length"];i++){
				//check 
			
			tableCoord += "<td style='width: 14.1455%; height: 18px; text-align: center;'><div><div class='col-md-2 form-check form-check-inline'><input id='chekJefe' class='form-check-input' name='tipo[]' type='checkbox' value='"+list['response'][i]["id"]+"' /> <label class='form-check-label' for='inlineCheckbox1'></label></div></div></td>";
	
			}
			tableCoord += "</tr>";
			tableCoord += "</tbody></table>"
			$("#tblcoord").append(tableCoord);

		}).fail(function(response){
			console.log(response);
		});

		$("#tableContent").children().remove();
		$("#btnGenerate").removeAttr('disabled');
        $("#btnGenerate").off("click");
        $("#btnGenerate").click(function(e){
			var selector = $("#selecTipo").val();
            var dateTraicingIni = new Date($("#dateTraicingIni").val()) ;
			var dateTraicingFin =  new Date($("#dateTraicingFin").val()); 
			console.log($("#dateReportIni").val());
			console.log(dateTraicingIni);
			console.log();		
			var fechainicial ="";
			var fechafinal ="";
			var tipo = 1;
			
			var mensaje  = "";

			if(selector == ""){
				mensaje = "Por favor seleccione la consulta "
				cargartoast("Validacion",mensaje)
			}else if($("#dateTraicingIni").val() == "" || $("#dateTraicingFin").val() == ""){
				mensaje = "Por favor escoga la fecha  que desea"
				cargartoast("Validacion",mensaje)
	
			}else{


				var fechainicial =  dateTraicingIni.toISOString().split('T')[0];  
				var fechafinal =  dateTraicingFin.toISOString().split('T')[0];    
				fechainicial = fechainicial +' 00:00:00'
				fechafinal = fechafinal +' 23:59:00'
				var selected = new Array();    
				$('input[type=checkbox]:checked').each(function(){
						selected.push($(this).val());
						
				}); 

				if (selected.length === 0) {
					mensaje = "Debes selecionar alguna coordinadora";
					cargartoast("Validacion",mensaje)
					return false;
				}
				else
				{

					if(selector=="mensajes"){
						consultMessTransport(fechainicial,fechafinal,selected,tipo);		
					}else if (selector=="quejas"){
						consultQuejTransport(fechainicial,fechafinal,selected,tipo);		
					}		
					
		
				}

			}e.preventDefault();
        }); 

		$("#btnReport").removeAttr('disabled');
        $("#btnReport").off("click");
		$("#btnReport").click(function(e){
			var selector = $("#selecTipo").val();
            var dateTraicingIni = new Date($("#dateTraicingIni").val()) ;
			var dateTraicingFin =  new Date($("#dateTraicingFin").val()); 
			console.log($("#dateReportIni").val());
			console.log(dateTraicingIni);
			console.log();		
			var fechainicial ="";
			var fechafinal ="";
			var tipo = 2;
			
			var mensaje  = "";

			if(selector == ""){
				mensaje = "Por favor seleccione la consulta "
				cargartoast("Validacion",mensaje)
			}else if($("#dateTraicingIni").val() == "" || $("#dateTraicingFin").val() == ""){
				mensaje = "Por favor escoga la fecha  que desea"
				cargartoast("Validacion",mensaje)
	
			}else{


				var fechainicial =  dateTraicingIni.toISOString().split('T')[0];  
				var fechafinal =  dateTraicingFin.toISOString().split('T')[0];    
				fechainicial = fechainicial +' 00:00:00'
				fechafinal = fechafinal +' 23:59:00'
				var selected = new Array();    
				$('input[type=checkbox]:checked').each(function(){
						selected.push($(this).val());
						
				}); 

				if (selected.length === 0) {
					mensaje = "Debes selecionar alguna coordinadora";
					cargartoast("Validacion",mensaje)
					return false;
				}
				else
				{

					if(selector=="mensajes"){
						consultMessTransport(fechainicial,fechafinal,selected,tipo);		
					}else if (selector=="quejas"){
						consultQuejTransport(fechainicial,fechafinal,selected,tipo);		
					}		
					
		
				}

			}e.preventDefault();
        }); 
	});
}



function exportTableToExcelTra(table,tipo){
	var uri = 'data:application/vnd.ms-excel;base64,'
	, template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
	, base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
	, format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

	var date = new Date()
	var fecha =  date.toISOString().split('T')[0];  


	
	var name = 'Reporte-'+tipo+'-'+fecha;

	if (!table.nodeType) table = document.getElementById(table)
	 var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
	 window.location.href = uri + base64(format(template, ctx))
}



function ViewstracingMesJefeNs(){
	$("#content").load("views/traicingMessJef.html?v=1.0",function(){
		
		let tipojefe = gettipojef()
		$.when(tipojefe).done(function(list){
			console.log(list);	
			if (list["response"][0]["tipo_jefe"]=="1"){
				$("#labeljefe").removeClass("d-none")
				$("#labeldocen").removeClass("d-none")
				$("#labeldirect").removeClass("d-none")
				$("#labelConv").removeClass("d-none")
				$("#labelAca").removeClass("d-none")
				$("#labelPsico").removeClass("d-none")
				$("#tdjefe").removeClass("d-none")
				$("#tddocent").removeClass("d-none")
				$("#tddirect").removeClass("d-none")
				$("#tdcorvi").removeClass("d-none")
				$("#tdaca").removeClass("d-none")
				$("#tdpsico").removeClass("d-none")
			}else if(list["response"][0]["tipo_jefe"]=="2"){
				$("#labelAdmis").removeClass("d-none")
				$("#labelSiste").removeClass("d-none")
				$("#labelCalid").removeClass("d-none")
				$("#labelaliment").removeClass("d-none")

				$("#tdalim").removeClass("d-none")
				$("#tdsist").removeClass("d-none")
				$("#tdadm").removeClass("d-none")
				$("#tdcalid").removeClass("d-none")
			}else{
				$("#labelCart").removeClass("d-none")
				$("#labelTrans").removeClass("d-none")
				$("#labelEnf").removeClass("d-none")
				$("#labelCert").removeClass("d-none")
				$("#labelMant").removeClass("d-none")

				$("#tdcart").removeClass("d-none")
				$("#tdtrans").removeClass("d-none")
				$("#tdsst").removeClass("d-none")
				$("#tdcert").removeClass("d-none")
				$("#tdMan").removeClass("d-none")
			}
		
		}).fail(function(response){
			console.log(response);
		});





		$("#tableContent").children().remove();
		$("#btnGenerate").removeAttr('disabled');
        $("#btnGenerate").off("click");
        $("#btnGenerate").click(function(e){
			var secciones = $("#selecSecc").val();
			var selector = $("#selecTipo").val();
			var satisfacc = $("#chekNivReg").prop('checked')
            var dateTraicingIni = new Date($("#dateTraicingIni").val()) ;
			var dateTraicingFin =  new Date($("#dateTraicingFin").val()); 
			console.log($("#chekNivReg").val());
			console.log(dateTraicingIni);
			console.log();		
			var fechainicial ="";
			var fechafinal ="";

			
			var mensaje  = "";

			if(selector == ""){
				mensaje = "Por favor seleccione el tipo de mensajes "
				cargartoast("Validacion",mensaje)
			}else if(secciones==""){
				mensaje = "Por favor seleccione la seccion correspondiente "
				cargartoast("Validacion",mensaje)
			}else if($("#dateTraicingIni").val() == "" || $("#dateTraicingFin").val() == ""){
				mensaje = "Por favor escoga la fecha  que desea"
				cargartoast("Validacion",mensaje)
	
			}else{

				fechainicial =  dateTraicingIni.toISOString();
				fechafinal =    dateTraicingFin.toISOString();
				var selected = new Array();    
				$('input[type=checkbox]:checked').each(function(){
						selected.push($(this).val());
						
				}); 

				if (selected.length === 0) {
					mensaje = "Debes selecionar alguna coordinadora";
					cargartoast("Validacion",mensaje)
					return false;
				}
				else
				{
					

					if(selector=="mensajes"){
						consultMessage_Jef(fechainicial,fechafinal,selected,secciones,satisfacc);		
					}else if (selector=="quejas"){
						consultQuejas_jef(fechainicial,fechafinal,selected,secciones,satisfacc);		
					}		
					
		
				}

			}e.preventDefault();
        }); 
	});
}




function consultMessTransport(fechainicial,fechafinal,selected,tipo){
	console.log(fechainicial,fechafinal,selected)

	
	var mensaje ="";
   
    if (fechainicial > fechafinal) {
			console.log("Date Error1");
			mensaje = "Ingrese una fecha inferior a la fecha final "
			cargartoast("Error",mensaje)
			return
    }

	var messages = gettraicingMessage(fechainicial,fechafinal,selected,3,'',0)
		console.log(messages);
		$.when(messages).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

				console.log(selected)
				var  tableMessaf = "<table border='1' id='tbtraMesaage'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += " style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>RutaM</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Curso</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Mensaje</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatario</th>";
				tableMessaf += "</tr></thead><tbody id='tablemess'>"; 
				for(var i= 0; i<list['response']["length"];i++){
					codigo = list['response'][i]["id_message"];
				tableMessaf += "<tr>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["ruta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Respuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["EstadoDestinatario"]+"</td>";
				tableMessaf += "</tr>";
				}
				tableMessaf +="</tbody></table>";
					
					$("#tableContent").append(tableMessaf);
					$("#btnSubmit").removeClass('disabled');
					if(tipo==1){//consulta
						$("#tableContent").removeClass("d-none");
					}else{
						$("#tableContent").addClass("d-none");
						exportTableToExcelTra('tbtraMesaage','mensajes')
					}

				
					var tableTransMessage = $('#tbtraMesaage').DataTable({
						orderCellsTop: true,
						fixedHeader: true 
					 });
					 //Creamos una fila en el head de la tabla y lo clonamos para cada columna
				//	$('#tbtraMesaage thead tr').clone(true).appendTo( '#tbtraMesaage thead' );
			
					$('#tbtraMesaage thead tr:eq(1) th').each( function (i) {
						var title = $(this).text(); //es el nombre de la columna
						/*$(this).html( '<input type="text" placeholder="Search...'+title+'" />' );*/
				
						$( 'input', this ).on( 'keyup change', function () {
							if ( tableTransMessage.column(i).search() !== this.value ) {
								tableTransMessage
									.column(i)
									.search( this.value )
									.draw();
							}
						} );
					} );   
					


			}else if(list["code"] == 400) {

				var mensaje = "No se registraron mensajes"
					cargartoast("Validacion",mensaje)
					$("#btnSubmit").addClass('disabled');
					$("#tableContent").empty ();
					
						
			}else{
				var mensaje1 = "Error por favor volver a cargar"
					cargartoast("Consulta",mensaje1)
					$("#btnSubmit").addClass('disabled');
				
			}
				
		}).fail(function(response){
			console.log(response);
		});
		
		$("#contentReport").removeClass("d-none");	

		



}

function consultQuejTransport(fechainicial,fechafinal,selected,tipo){
	console.log(fechainicial,fechafinal,selected)

	
	var mensaje ="";
   
    if (fechainicial > fechafinal) {
			console.log("Date Error1");
			mensaje = "Ingrese una fecha inferior a la fecha final "
			cargartoast("Error",mensaje)
			return
    }

	var messages = gettraicingMessage(fechainicial,fechafinal,selected,4,'',0)
		console.log(messages);
		$.when(messages).done(function(list){
	
			if (list["code"] == 200) {
					console.log(list);
					console.log(list['response']["length"]);
				
					$("#tableContent").children().remove();

				console.log(selected)
				var  tableMessaf = "<table border='1' id='tbTraQueja'  align='center' class = 'table table-responsive table-hover table-sm table-bordered table-striped animated fadeIn'  ";
				tableMessaf += " style='font-size:14px;'><thead class='thead-active text-center'><tr>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Destinatario </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estudiante</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>RutaM</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Curso</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Envio </th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Asunto</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Mensaje</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado</th> ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Fecha Respuesta</th>  ";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Respuesta</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Estado Destinatario</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Justificado</th>";
				tableMessaf += "<th class='title' scope='col' style='text-align: center; vertical-align: middle;'>Motivo</th>";


				tableMessaf += "</tr></thead><tbody id='tablequej'>"; 
				for(var i= 0; i<list['response']["length"];i++){
					codigo = list['response'][i]["id_message"];
				tableMessaf += "<tr>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue text-center div'>"+list['response'][i]["Destinatario"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Estudiante"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["ruta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Curso"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaEnvio"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Asunto"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Mensaje"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["estado"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["FechaRespuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Respuesta"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["EstadoDestinatario"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["Justificado"]+"</td>";
				tableMessaf += "<td style='vertical-align:middle;' class='celValue  text-center div'>"+list['response'][i]["motivo"]+"</td>";

				tableMessaf += "</tr>";
				}
				tableMessaf +="</tbody></table>";
					

					$("#tableContent").append(tableMessaf);
					if(tipo==1){//consulta
						$("#tableContent").removeClass("d-none");
					}else{
						$("#tableContent").removeClass("d-none");
						exportTableToExcelTra('tbTraQueja','quejas')
					}
					$("#btnSubmit").removeClass('disabled');	
					

				
		var tbTraQueja = $('#tbTraQueja').DataTable({
			orderCellsTop: true,
			fixedHeader: true 
		 });
		 //Creamos una fila en el head de la tabla y lo clonamos para cada columna
	    //$('#tbTraQueja thead tr').clone(true).appendTo( '#tbTraQueja thead' );

	

		$('#tbTraQueja thead tr:eq(1) th').each( function (i) {
			var title = $(this).text(); //es el nombre de la columna
		/*
			$(this).html( '<input type="text" placeholder="Search...'+title+'" />' );*/
	
			$( 'input', this ).on( 'keyup change', function () {
				if ( tbTraQueja.column(i).search() !== this.value ) {
					tbTraQueja
						.column(i)
						.search( this.value )
						.draw();
				}
			} );
		} );   
		


			}else if(list["code"] == 400) {

				var mensaje = "No se registraron mensajes"
					cargartoast("Validacion",mensaje)
					$("#btnSubmit").addClass('disabled');
					$("#tableContent").empty ();
					
						
			}else{
				var mensaje1 = "Error por favor volver a cargar"
					cargartoast("Consulta",mensaje1)
					$("#btnSubmit").addClass('disabled');
				
			}
				
		}).fail(function(response){
			console.log(response);
		});
		
		$("#contentReport").removeClass("d-none");	


}

function modalRespuestLider(Message,destinatar){
	console.log(Message)
	let content = getContentLider(Message,destinatar);
	console.log(content);
					$.when(content).done(function(responseCont){
						console.log(responseCont["response"][0]);
						modalRespuesta(responseCont["response"][0]);

					}).fail(function(responseCont){
						console.log(responseCont);
					});
}



function modalRespuesta(objectMessage){
		
	$("#bodyTagLarge").load("views/adminView/modalMesagesTransp.html?v=1.0",function(){

			let destinatario = objectMessage["id_destinat"]
			$("#titleModalLarge").text("Mensaje N° "+objectMessage["Num"]+": "+objectMessage["Tema"]);
			$("#titleModalLarge").css('text-align', 'center');
			/*  $("#lbasunto").text(objectMessage["Asunto"]);*/
			$("#lbstudent").text(objectMessage["student"]);
			$("#lbrespuCoord").text(objectMessage["respuesta"]);
		
			$("#lbmensage").text(objectMessage["mensaje"]);
			$("#btnModalLarge").off();
			$("#btnModalLarge").removeAttr('disabled');
			$("#btnModalLarge").removeClass('d-none');
			$("#btnModalLarge").text("Enviar");
			$("#btnModalLarge").click(function (e) {
				let num_message = objectMessage["Num"];
				let restablecer= 0;
				let actionEntry1="";
				let descripcion = $("#description").val();
				console.log(descripcion);
				if (document.getElementById('checkValid').checked)
				{
				restablecer = 1;
				}



				if (descripcion==""){
					alert("Por favor digite la respuesta,Gracias");

						
				}else{
					actionEntry1= resultComentLider(
						num_message,
						destinatario,
						descripcion,
						restablecer	);
				
				
			
					console.log("cargo funcion");
				
				
					$("#btnModalLarge").html(
						"Ingresando   <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>"
					);
					
					$("#btnModalLarge").attr("disabled", true);
				
					$.when(actionEntry1).done(function(response) {	 
		
						if (response["code"] == 200 ) {
							$("#ModalLargeObs").modal("hide");
							mensaje = "Quedo registrada la respuesta a su mensaje. Gracias"
							cargartoast("Ejecución",mensaje)
						
							ViewNewsMessag();
							var code_resp = 200;
						} else if(response["response"]["code"]  == 450){
							alert("Su sesion ha caducado por favor cierre y vuela e ingrese, gracias")
							location.href = "../index.html";
			
						}else if (
							response["code"] == 200 &&
							response["response"][0] == false
							
						) {
							$("#ModalLargeObs").modal("hide");
							var code_resp = 500;
						}
					}).fail(function (response) {
						//console.log("fail Entry");
						//console.log(response);
						
					});
					ViewNewsMessag();
					$(".labelInvalid").each(function () {
						$(this).removeClass("labelInvalid");
						$(this).removeClass("animated infinite pulse");
					});
				
				};
			
			});
			
			$("#ModalLargeObs").off("hidden.bs.modal");
			$("#ModalLargeObs").modal("show");
			$('.modal-backdrop').remove(); 
	
		
	});

}