
function cargarFiltrobusqueda(divID, datos) {
    if (!datos || datos.length === 0) {
        $(`#${divID}`).html("<p>No hay datos disponibles</p>");
        return;
    }

    let contenido = "";

    // **Agregar input de búsqueda solo en Estudiantes y Destinatarios**
        contenido += `<input type="text" class="form-control mb-2 filtro-busqueda" 
                        placeholder="Buscar..." data-target="${divID}">`;
        contenido += `<div class="checkbox-container" style="display: none;"></div>`;
    

    $(`#${divID}`).html(contenido);

    // **Guardar los datos en un atributo del div**
    $(`#${divID}`).data("datos", datos);
}


function filtrarChecksearch(input) {
    let filtro = input.val().toLowerCase();
    let contenedorID = input.data("target");
    let contenedor = $(`#${contenedorID} .checkbox-container`);
    let datos = $(`#${contenedorID}`).data("datos");
  
    if (filtro === "") {
        contenedor.html("").hide();
        return;
    }
  
    let resultado = datos.filter(item => item.description.toLowerCase().includes(filtro));
    let contenido = resultado.map(item => `
        <div class="form-check">
            <input class="form-check-input filtro-elegido" data-descripcion="${item.description}" type="checkbox" id="chk_${item.id}" value="${item.id}">
            <label class="form-check-label checkbox-label" for="chk_${item.id}">${item.description}</label>
        </div>
    `).join("");
  
    contenedor.html(contenido).toggle(contenido !== "");
}



function consultadestinatario(id) {
    getdestin(id).done(function(response) {
        let destinatarios = response["response"];
        if (!destinatarios || destinatarios.length === 0) {
            console.warn("No se encontraron destinatarios.");
            return;
        }
  
        // Limpia los contenedores antes de agregar nuevos elementos
        $("#dvdestinatario").html("");  
        $("#divddestcremplaz").html(""); 
  
        let tipo = destinatarios[0]?.tipo ?? "No tienen";
        let usuario = destinatarios[0]?.usuario ?? "No tienen";
  
        let destinatario = `<input type='text' value='${usuario} ${tipo == "0" ? "Cerrado" : ""}' 
                            class='col-12' disabled style='text-align: center'>`;
  
        $("#dvdestinatario").html(destinatario); // Usa html() en lugar de append()
  
        if (destinatarios.length > 1) {
            $("#divdbuscremplaz").addClass("d-none"); // Oculta el div si hay más de un destinatario
            let usuarioReemplazo = destinatarios[1]["usuario"];
            let destinatarioRemplazo = `<input type='text' value='${usuarioReemplazo}' 
                                        class='col-12' disabled style='text-align: center'>`;
            $("#divddestcremplaz").html(destinatarioRemplazo);
        }
    }).fail(function(error) {
        console.error("Error en la consulta:", error);
    });
  }
  
  
  
  function buscardestinata(tipo,codigo,select){
    let buscardestinat= buscardest();
    $.when(buscardestinat).done(function(response){
      cargarFiltrobusqueda(select,response["response"]);
    })
}

function cargarDestin(){
    let destin = $(".filtro-elegido:checked").val();
    const codigos = destin.split("/");
    let destinat = codigos[0];
    let proceso = codigos[1]
    var destinatario = buscardestOtros(destinat);
    var table = "";
    $("#tablagestion").removeClass("d-none");
    $.when(destinatario).done(function(datos){
        table += "<tr>";
        table += "<td class='celValue text-center'>"+datos['response'][0]["id"]+"</td>";
        table += "<td class='celValue text-center'>"+datos['response'][0]["description"]+"</td>";
        table += "</tr>";
        
        

        $("#tabledestin").append(table);
    });
}


async function fillView(part, customData = null, pagination = null, perfii = null) {
    if (part === "all" || part === "one") {
        new CardView("#section_one .part_one", "REASIGNAR");
    }
    if (part === "all" || part === "two") {
        new CardView("#section_one .part_two", "CONSULTAR O CONTESTAR");
    }
    if (part === "all" || part === "three") {
        new CardView("#section_one .part_three", "QUEJAS");
    }
    if (part === "all" || part === "four") {
        new CardView("#section_one .part_four", "MENSAJES",customData, pagination);
    }
}


function cardTittle(text){
    var text = "<h5 class='card-title'>"+text+"</h5>";
    return text
}

function classTipeMessage (Type) {
    return classT = Type === 'Mensaje'?'badge text-bg-primary rounded-pill':'badge text-bg-danger rounded-pill';
}

function recipient_replacement(tipo_mensaje,codigo){
    $("#titleModalLarge").text(" Cambio de destinatario" );
    $("#bodyTagLarge").children().remove();
    $("#bodyTagLarge").load("views/adminView/modalUpdateDestin.html?v=3.1", function () {
        consultadestinatario(codigo)
        buscardestinata(tipo_mensaje,codigo,"selectdestint");
        $("#btnModalLarge").removeClass("d-none");
        $("#btnModalLarge").text("Remplazar");
        $("#ModalLargeObs").modal({ backdrop: "static", keyboard: false });
        $("#ModalLargeObs").modal("show");
        $("#btnModalLarge").off('click').on('click',function (e) {
            e.preventDefault(); // Evitar que el botón recargue la página
            let destin = $(".filtro-elegido:checked").val();
            if (!destin) {
                console.log("No hay checkbox seleccionado");
                return;
            }
            let actionEntry = "";
            const codigos = destin.split("/");
            let codig_usu = codigos[0];
            let codigo_Procs = codigos[1]
            actionEntry = submit_redirect(codigo,codig_usu , codigo_Procs,1,1,1);
            $("#btnModalLarge").html("Ingresando <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>");
            $("#btnModalLarge").attr("disabled", true);
            $.when(actionEntry).done(function () {
                var toastMessage_ = {"service":"Notifición","200":"Datos enviados", "400":"Por favor digite todos los campos","500":"Error al guardar"};
                toastr_message2(200,toastMessage_);
                $("#ModalLargeObs").modal('hide');
                
                setTimeout(() => {
                        //cargardatos(codigo);
                    $('#section_one .part_one').empty();
        
                    // Volver a llenar la vista
                    fillView("all");
                }, 1000); // 2000 ms = 2 segundos

            }).fail(function () {
                toastr_message2(500,toastMessage_);
            });
        });
    })
  $("#ModalLargeObs").off("hidden.bs.modal");

}

function createCard (divId,data,totalMensaje,pag,dataArray) {
    customDataDataArray
    var templete = '<div class="search-container"><i class="fas fa-search search-icon"></i><input type="text" class="form-control" placeholder="Buscar estudiante, código, proceso..." id="search_name"></div>';
    var estado, mensaje, typeIcono;
    if(divId === "#section_one .part_four") {

        templete = `<div class="search-container">
            <button class="btn btn-modern btn-reassign" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                <i class="fas fa-filter"></i> FILTROS
            </button>
            ${customDataDataArray['code'] === 200 ? `
            <button class="btn btn-modern btn-excel" type="button">
                <i class="fas fa-file-excel"></i> EXCEL
            </button>` : ''}
            </div> `;

        templete +=` <div id="modalFilter"></div>`;
    }
    if(data === undefined){
       return templete = `<div class="card"><div class="card-body"> <h5 class="card-title">Sin mensajes</h5><p class="card-text">No se encontraron mensajes en esta sección.</p></div></div>`
    }
    data.forEach(element => {
        classT = classTipeMessage(element.Tipo_Mensaje)
        typeIcono =icono(element)
        mensaje = (element.Tipo_Mensaje === 'Mensaje')?element.Tipo_Mensaje:`${element.Tipo_Mensaje} - ${element.justificadoTexto} `;
        $('[data-tipo="Mensaje"]').addClass('badge text-bg-primary rounded-pill');
        estado = element.estado == 'EN TRAMITE'?element.estado_proceso:element.estado;
        templete += `<div class="message-item active special card" data-cod="${element.cod_mensaje}" data-special="${estado}">
                        <div class="card-header py-3 bg-gradient rounded-top-4 border-0">
                            <div class="d-flex justify-content-between align-items-center">
                            <h6 class="d-flex justify-content-between align-items-center">${element.Estudiante}</h6>
                            <span class="${classT}"> ${mensaje}  </span>
                            </div>
                        </div>
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-1 small text-muted">
                                <i class="fas fa-book me-1"></i> ${element.Curso}
                                <i class="fas fa-calendar-alt me-1"></i> ${element.fecha_registro}
                                <i class="fas fa-clock me-1"></i> ${element.hora_registro}
                            </p>
                            ${typeIcono}
                            </div>
                    
                            <div class="d-flex justify-content-between align-items-center mb-1">
                            <p class="mb-0 small text-muted">
                                <i class="fas fa-briefcase me-1"></i>${element.Tema}
                                <i class="fas fa-briefcase me-1"></i>${element.cod_mensaje}
                            </p>
                            <span class="badge text-bg-light fs-7 px-2 py-1">${element.Proceso}</span>
                            </div>
                    
                            <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-0 small text-muted">
                                <i class="fas fa-paper-plane me-1"></i> ${element.Destinatarios} 
                            </p>
                            <p class="mb-0 small text-muted">${estado}</p>
                            </div>
                        </div>
                </div>`
    });
    if(divId === "#section_one .part_four") {
        var TotalM = Math.ceil(totalMensaje.total_Mensajes / 50);
        templete += new Pagination(TotalM, pag ,divId,dataArray).render();
    }
    return templete;
}

function icono(datos,type=false) {  
  const nivel = (type == false)?datos.nivel_satisfaccion:datos.nivel_satisfaccionII;
  const niveles = {
    "Exelente": {
      icon: "fa-face-laugh",
      color: "#098b29",
      label: "E"
    },
    "Bien": {
      icon: "fa-face-smile",
      color: "#ffde38",
      label: "B"
    },
    "Regular": {
      icon: "fa-face-meh",
      color: "#ee8917",
      label: "R"
    },
    "Malo": {
      icon: "fa-face-frown",
      color: "#d71919",
      label: "M"
    }
  };

  const info = niveles[nivel];
  if (!info) return "";
  return `
    <span class="px-1 py-1">
      <i class="fa-solid fa-xl ${info.icon}" style="color:${info.color}"></i><strong> ${info.label}</strong>
    </span>`;
}

function createCardReassing (div,data,img) {
    return new Promise((resolve, reject) => {
        try {
            var image = (img == "")?"SIN FOTO":"data:image/jpeg;base64,"+img.foto;
            $(`${div}`).load("views/TempleteReassing.html?v=3.1", function(){
                const container = $(this);
                var classT = classTipeMessage (data.Tipo_Mensaje);
                container.find("#student-img").attr("src",image)
                container.find("#student-name").text(data.Estudiante);
                container.find("#student-course").text(data.Curso);
                container.find("#student-code").text(data.cod_estudiante);
                container.find("#text-code").text(data.cod_mensaje);
                container.find("#student-date").text(data.fecha_registro);
                container.find("#student-hour").text(data.hora_registro);
                container.find("#student-clasification").addClass(classT);
                container.find("#student-clasification").text(data.Tipo_Mensaje);
                container.find("#student-proceso").text(data.Proceso);
                container.find("#textasunto").text(data.asunto+"-"+data.Tema);
                container.find("#textdestinatario").text(data.Destinatarios);
                container.find("#textmensaje").text(data.mensaje);
                container.find("#textredirigido").text(data.motivo);

                container.find("#FechaRevision").text(data.fecha_revisado);
                container.find("#HoraRevision").text(data.hora_revisado);
                container.find("#FechaRespuesta").text(data.fecha_respuesta);
                container.find("#HoraRespuesta").text(data.hora_respuesta);
                $("#btnremplazo").off('click').on('click', function(e) {
                    recipient_replacement(data.Cod_Tipo_Mensaje,data.cod_mensaje)
                })
            }) 
        } catch (error) {
            console.error(error)
        }
    })
    
   
}

function createCardToAnswer(div, dataList, img) {
    return new Promise((resolve, reject) => { 
        try {
            $(div).html(""); 
            const image = (img == "") ? "SIN FOTO" : "data:image/jpeg;base64," + img.foto;
            $.get("views/TempleteToAnswer.html?v=3.1", function (templateHtml) {
                const $template = $(templateHtml);
                const $header = $template.find(".d-flex.align-items-start").clone();
                const $body = $template.find(".card-body .mensajeBody").clone();
                const classT = classTipeMessage(dataList[0].Tipo_Mensaje); 
                $header.find("#student-img").attr("src", image);
                $header.find("#student-name").text(dataList[0].Estudiante);
                $header.find("#student-course").text(dataList[0].Curso);
                $header.find("#student-date").text(dataList[0].fecha_registro);
                $header.find("#student-hour").text(dataList[0].hora_registro);
                $header.find("#student-clasification").addClass(classT).text(dataList[0].Tipo_Mensaje);
                $header.find("#textmensaje").text(dataList[0].mensaje);
                $header.find("#textproceso").text(dataList[0].Proceso1);
                $header.find("#student-code").text(dataList[0].cod_estudiante);
                $header.find("#text-code").text(dataList[0].cod_mensaje);
                const $card = $('<div class="card shadow-lg border-0 rounded-4 overflow-hidden mb-3 list-group my-3"></div>');
                $card.append($header);
                // Recorrer lista y clonar solo el cuerpo
                dataList.forEach(data => {
                    const $newBody = $body.clone();
                    // LOGICA DE CADA ESTILO, CLASES Y PROPIEDADES
                    const tema = data.Proceso === null? data.Tema:data.Proceso;
                    const td = $newBody.find("#EstadoRevision");
                    td[0].dataset.special = data.estado_proceso;
                    let estadoTexto = "";
                    if (data.estado_dest == 7) {
                        estadoTexto = `<i class="fas fa-exchange-alt"></i> Motivo de redireccionamiento`;
                    }else if(data.estado_dest == 4){
                        estadoTexto = `<i class="fas fa-exchange-alt"></i> Respuesta`;
                    } else {
                        $newBody.find("#divredirigido").addClass('d-none');
                    }
                    // FIN DE LOGICA
                    // EMPIEZA A INSERTAR LAS COPIAS
                    var respuesta = (data.motivo === "")?data.respuesta:data.motivo;
                    $newBody.find("#textasunto").text(data.asunto + " - " + tema);
                    $newBody.find("#textdestinatario").text(data.Destinatarios);
                    $newBody.find("#FechaRevision").text(data.fecha_revisado);
                    $newBody.find("#HoraRevision").text(data.hora_revisado);
                    $newBody.find("#FechaRespuesta").text(data.fecha_respuesta);
                    $newBody.find("#HoraRespuesta").text(data.hora_respuesta);
                    $newBody.find("#textredirigido").text(respuesta);
                    $newBody.find("#EstadoRevision").text(data.estado_proceso);
                    $newBody.find("#textstatus").html(`${estadoTexto}`);
                
                    // AQUÍ INSERTA LAS COPIAS DE LOS TEMPLETES

                    $card.append($newBody);
                });
                
                $(div).append($card);
            });
        } catch (error) {
            console.error(error);
        }
    })

}

function toastr_message2(code, messages) {
    let config = {showConfirmButton: false,timer: 1500};
    switch(code) {
        case 200:
            config.icon = "success";
            config.title = messages[200];
            config.position = "top-end";
            break;
        case 300:
            config.icon = "info";
            config.title = messages[300];
            config.position = "top-end";
            break;
        case 400:
            config.icon = "info";
            config.title = messages[400];
            config.position = "top-end";
            break;
        case 500:
            config.icon = "error";
            config.title = messages[500];
            config.position = "top-end";
            break;
        default:
            return false;
    }

    return Swal.fire(config);
}

function diferenciaFecha_(dateInitial, dateFinal) {
    const fechaInicio = new Date(dateInitial);
    const fechaFin = new Date(dateFinal);
    
    // Calcula la diferencia en milisegundos
    const diferenciaMs = fechaFin - fechaInicio;

    // Convierte milisegundos a días
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    var plural = (diferenciaDias == 1 )?' día':' días';
    return diferenciaDias + plural;
}

function createSelect_(id, select = false, typePerfil = false) {
    var option = "";
    var addedOptions = {};
    if(id == 'Filter-Curse' ){
        for(var i =1; i <= select; i++){
            var descripcion = getDescripcionByCurso(i);
            option += '<option data-val="' + i +'" value="' + i +'">' + descripcion.curso + '</option>';
        }
    }else{
        if (select != false) {
            $(select).each(function(key, index) {
                if (id == 'Filter-Grade') {
                        option += '<option data-val="' + index.n_cursos +'" value="' + index.id +'">' + index.description + '</option>';
                        addedOptions[index.subject] = true;
                } 
                else{
                    if (!addedOptions[index.description]) {
                        option += '<option value="' + index.id + '"  data-val="' + index.description +'">' + index.description + '</option>';
                        addedOptions[index.description] = true;
                    }
                }
            });
        }
    }
    $("#" + id).empty();
    option = '<option selected value="" id="--">--</option>' + option;
    $("#" + id).append(option);
}

function createTomSelect(id, type, options) {
  const selectId = `Filter-${id}`;

  // Crear el HTML del <select>
  let html = `<label for="${selectId}" class="form-label fw-bold">${type}</label>`;
  html += `<select id="${selectId}" class="Filter ${id}" multiple placeholder="Seleccione...">`;

  options.forEach(option => {
    html += `<option value="${option.id}">${option.description}</option>`;
  });

  html += `</select>`;

  // Agregar al contenedor
  $("#" + id).html(html);

  // Inicializar Tom Select
  new TomSelect(`#${selectId}`, {
    plugins: ['remove_button'],
    maxItems: null,
    dropdownParent: 'body',
    persist: false,
    create: false
  });
}

function getDescripcionByCurso(id) {
    const descripciones = {
        1: { grado: "PREJARDÍN", curso: "A" },
        2: { grado: "JARDÍN", curso: "B" },
        3: { grado: "TRANSICIÓN", curso: "C" },
        4: { grado: "PRIMERO", curso: "D" },
        5: { grado: "SEGUNDO", curso: "E" },
        6: { grado: "TERCERO", curso: "F" },
        7: { grado: "CUARTO", curso: "G" },
        8: { grado: "QUINTO", curso: "H" },
        9: { grado: "SEXTO", curso: "I" },
        10: { grado: "SÉPTIMO", curso: "J" },
        11: { grado: "OCTAVO", curso: "K" },
        12: { grado: "NOVENO", curso: "L" },
        13: { grado: "DÉCIMO", curso: "M" },
        14: { grado: "UNDÉCIMO", curso: "N" }
    };
    return descripciones[id] || null;
}

function optionSelect (object,id){
    let n_curso = object.find(':selected').data('val');
    createSelect_ (id,n_curso);
}

function createCardComplaints(div, dataList, img) {
    return new Promise ((resolve,reject) => {
        try {
            var codDest,dateAnswer;
            $(div).html(""); 
            const image = (img == "") ? "SIN FOTO" : "data:image/jpeg;base64," + img.foto;
        
            $.get("views/TempleteComplaints.html?v=3.1", async function (templateHtml) {
                const $template = $(templateHtml);
                const $card = $('<div class="card shadow-lg border-0 rounded-4 overflow-hidden mb-3 list-group my-3"></div>');
                const $header = $template.find(".d-flex.align-items-start").clone();

                const $body = $template.find(".card-body .mensajeBody").clone();
                const classT = classTipeMessage(dataList[0].Tipo_Mensaje); 
                
                const $bodytwo = $template.find(".card-body .mensajeBodyTwo").clone();


                $header.find("#student-img").attr("src", image);
                $header.find("#student-name").text(dataList[0].Estudiante);
                $header.find("#student-course").text(dataList[0].Curso);
                $header.find("#student-code").text(dataList[0].cod_estudiante);
                $header.find("#text-code").text(dataList[0].cod_mensaje);
                $header.find("#student-date").text(dataList[0].fecha_registro);
                $header.find("#student-hour").text(dataList[0].hora_registro);
                $header.find("#student-clasification").addClass(classT).text(dataList[0].Tipo_Mensaje);
                $header.find("#textmensaje").text(dataList[0].mensaje);
                $header.find("#textproceso").text(dataList[0].Proceso1);
                $header.find("#textjustificacion").text(dataList[0].justificadoTexto);
                
                $card.append($header);
                dataList.forEach(data => {
                    codDest = data.cod_destinatario;
                    dateAnswer = data.fecha_respuesta;
                    const $newBody = $body.clone();
                    // LOGICA DE CADA ESTILO, CLASES Y PROPIEDADES
                    const tema = data.Proceso === null? data.Tema:data.Proceso;
                    const td = $newBody.find("#EstadoRevision");
                    td[0].dataset.special = data.estado_proceso;
                    let estadoTexto = "", textmotivo;
                    if (data.estado_dest == 7) {
                        estadoTexto = `<i class="fas fa-exchange-alt"></i> Motivo de redireccionamiento`;
                        textmotivo = data.motivo;
                    } else  {
                        estadoTexto = `<i class="fas fa-exchange-alt"></i> Respuesta`;
                        textmotivo = data.respuesta;
                    } 
                    // FIN DE LOGICA

                    // EMPIEZA A INSERTAR LAS COPIAS
                    $newBody.find("#textasunto").text(data.asunto + " - " + tema);
                    $newBody.find("#textdestinatario").text(data.Destinatarios);
                    $newBody.find("#FechaRevision").text(data.fecha_revisado);
                    $newBody.find("#HoraRevision").text(data.hora_revisado);
                    $newBody.find("#FechaRespuesta").text(data.fecha_respuesta);
                    $newBody.find("#HoraRespuesta").text(data.hora_respuesta);
                    $newBody.find("#textredirigido").text(textmotivo);
                    $newBody.find("#EstadoRevision").text(data.estado_proceso);
                    $newBody.find("#textstatus").html(`${estadoTexto}`);
                
                    // AQUÍ INSERTA LAS COPIAS DE LOS TEMPLETES

                    $card.append($newBody);
                });

                // SI LA QUEJA ES JUSTIFICADA REALIZA ESTE EVENTO
                if(dataList[0].tipo_justificado === '2') {
                    var diferenciaFecha = diferenciaFecha_(dataList[0].fecha_registro,dateAnswer);
                    let motivoQueja = (dataList[0].motivo_queja === "0")?'N/A':dataList[0].motivo_queja;

                    $bodytwo.find("#comment-parent").text(dataList[0].comentarios_padre);
                    $bodytwo.find("#comment-student").text(dataList[0].comentarios_alumno);
                    $bodytwo.find("#plan-action").text(dataList[0].plan_accion);
                    $bodytwo.find("#date-limit").text(dataList[0].fecha_limite);
                    $bodytwo.find("#text-complaints").text(motivoQueja);
                    $bodytwo.find("#date-gestion").text(diferenciaFecha);
                    
                    const { cod_nivel_satifaccion,nivel_satisfaccion,fecha_satistaccion, coment_satistaccion, cod_nivel_satifaccionII,nivel_satisfaccionII,fecha_satistaccionII,coment_satistaccionII } = dataList[0];
                    if (cod_nivel_satifaccion === '2' || cod_nivel_satifaccion === '3') {
                        $bodytwo.find(".rowSatisfactionI").addClass('d-none');
                    } else {
                        if (cod_nivel_satifaccion === '1') {
                            $bodytwo.find(".rowSatisfactionI").addClass('table-warning');
                            $bodytwo.find("#satisfactionI").text('No ha calificado');
                        } else {
                            const typeIcono = icono(dataList[0]);
                            $bodytwo.find("#satisfactionI").html(`${typeIcono} ${nivel_satisfaccion}`);

                            if (cod_nivel_satifaccionII === '1') {
                                $bodytwo.find(".rowSatisfactionII").removeClass('d-none').addClass('table-warning');
                            } else if (cod_nivel_satifaccionII !== '0') {
                                $bodytwo.find(".rowSatisfactionII").removeClass('d-none');
                                const typeIconoII = icono(dataList[0], 2);
                                $bodytwo.find("#satisfactionII").html(`${typeIconoII} ${nivel_satisfaccionII}`);
                                $bodytwo.find("#date-SatisfactionII").text(fecha_satistaccionII);
                                $bodytwo.find("#coment-SatisfactionII").text(coment_satistaccionII);
                            }
                        }

                        $bodytwo.find("#date-SatisfactionI").text(fecha_satistaccion);
                        $bodytwo.find("#coment-SatisfactionI").text(coment_satistaccion);
                    }

                    // Esto es para el comentario del coordinador
                    if(dataList[0].coment_calidad != 0 || dataList[0].coment_calidad != "") {
                        $bodytwo.find("#coment-Calidad").val(dataList[0].coment_calidad); 
                    }
                    
                    $card.append($bodytwo); 

                }
                const $fooder = $template.find('.card-footer.text-end').clone();
                if (dataList[0].Tipo_Mensaje == "Queja" && (dataList[0].estado != "TRAMITADO" && dataList[0].estado_proceso != "TRAMITADO")) {
                    $card.append($fooder);
                }
                // esto es para el boton de circular
                if(dataList[0].tipo_justificado === '2' && (dataList[0].cod_nivel_satifaccion != "3" && dataList[0].cod_nivel_satifaccion != "2"&& dataList[0].cod_nivel_satifaccion != "1") && dataList[0].cod_nivel_satifaccionII == "0") {
                    $fooder.find("#btnSendSatistaction").removeClass("d-none");
                }
                
                $(div).append($card);
                
                
                // evento de botón cerrar queja
                $(div + " #btnclosecomplaints").off('click').on('click',function (e) { SaveComplaintsClosed(dataList[0].cod_mensaje,codDest,dataList)} )
                $(div + " #btnSendSatistaction").off('click').on('click',function (e) { SendSatisfaction(dataList[0]) } )
                $(div + " #btn-comment").off('click').on('click', function (e) { SaveComment(dataList[0]) });
            });
        } catch (error) {
            console.error(error);
        }
    })
    
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + "<span class=' btn-link'> <b> leer más... </b></span>" : text;
}

function openMore() {
    $(".table, .table-striped").off('click', '.celValue[data-val][data-item]')
    .on('click', '.celValue[data-val][data-item]', function () {
        var span = $(this);
        var fullText = span.data('fulltext');
        var shortText = truncateText(fullText, 30);

        if (!fullText || fullText ==0 || fullText =='--') return;

        if (span.hasClass('short-text')) {
            span.text(fullText).append("<span class=' btn-link'> <b> leer menos </b></span>");
            span.removeClass('short-text');
            span.closest('td').removeClass('td-collapsed').addClass('td-expanded');
        } else {
            span.html(shortText);
            span.addClass('short-text');
            span.closest('td').removeClass('td-expanded').addClass('td-collapsed');
        }
    });
}

function validationReassing(num,type){
	var toastMessage_ = {"service":"Notifición","200":"Datos enviados", "400":"Por favor digite el motivo de la devolucion, gracias","500":"Error en el servidor tiempo de espera"};
	$('#modalConfirm').modal('toggle');
	$("#btnValidAcept").click(function (e) {
		var motivo =  document.getElementById("txtMotivoRedir").value
		if(!motivo){
			toastr_message2(400,toastMessage_);
			return
		}
        saveReassing(num,type,motivo);
		switch (type) {
			case 'MENSAJE':
				ViewNewsMessag();
				break;
			case 'queja':
				ViewNewsQuejas();
				break;
			default:
				console.log(`error: no hay tarjeta ${type}`);
				break;
		}
	});
	$('.modal-backdrop').remove(); 
}


function saveReassing(num,type,motivo){
	let actionEntry= redirigir(num,motivo);
	$("#brnRedirigir").html(
		"Actualizando   <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>"
	);
	$("#brnRedirigir").attr("disabled", true);
	$.when(actionEntry).done(function(response) {
		if (response["code"] == 200) {
			$("#ModalLargeObs").modal("hide");
		}else if(response["response"]["code"] == 450){
			alert("Su sesion ha caducado por favor cierre y vuela e ingrese, gracias")
			location.href = "../index.html";
		}else {
			$("#ModalLargeObs").modal("hide");
		}
	})
    switch (type) {
        case 'MENSAJE':
            ViewNewsMessag();
            break;
        case 'queja':
            ViewNewsQuejas();
            break;
        default:
            console.log(`error: no hay tarjeta ${type}`);
            break;
    }
	$(".labelInvalid").each(function () {
		$(this).removeClass("labelInvalid");
		$(this).removeClass("animated infinite pulse");
	});
}

async function btnUpdateState(object, id, estado_dest, tipojust = "", contexto = "QUEJA") {
    try {
        var style = '" position: relative; padding: 15px 10px 30px 10px;"';
        var buttonupdate = "<div class='text-center' id='div" + id + "' style=" + style + ">";
        var num = parseInt(atob(id));

    
        //var viewFn = contexto === "QUEJA" ? "ViewNewsQuejas()" : "ViewNewsMessag()";
        var modalFn = contexto === "QUEJA" ? "modalMessaQuej" : "modalVistMessage";
        var modalTramiteFn = contexto === "QUEJA" ? "modalQuejas" : "modalVistMessage";

        if (object === "ENVIADO" || (object === "REDIRIGIDO" && estado_dest == 1) || (object === "EN TRAMITE" && estado_dest == 1)) {
            var respos = await sendMessage(num)
           console.log(respos);
            //eval(viewFn); // ejecuta la función según el contexto

            buttonupdate += "<button type='button' id='btnEstado' class='btn btn'><i class='fa fa-eye fa-sm'></i> Enviado</button>";
        }
        else if (object === "CONSULTADO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' onclick='${modalFn}(${num})' 
                            style='text-decoration: none;' id='btnEstado'>
                            <i class='fa fa-eye fa-sm'></i> CONSULTADO <br> PENDIENTE <br> POR RESPONDER</button>`;
        }
        else if (object === "EN TRAMITE") {
            if (estado_dest == 7 || (contexto === "MENSAJE" && estado_dest == 4)) {
                buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' disabled id='btnEstado' style='text-decoration: none;'> <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE/<br> CERRADO</button>";
            } else {
                if (contexto === "QUEJA" && tipojust === "Justificado") {
                    buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalTramiteFn}(${num})' style='text-decoration: none;'>
                                    <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE</button>`;
                } else {
                    buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalFn}(${num})' style='text-decoration: none;'>
                                    <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE <br> PENDIENTE <br> POR RESPONDER</button>`;
                }
            }
        }
        else if (object === "TRAMITADO") {
            buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'><i class='fa fa-check-circle fa-lg'></i> TRAMITADO</button>";
        }
        else if (object === "REDIRIGIDO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'>
                            <i class='fa fa-reply-all fa-lg'></i> REDIRIGIDO</button>`;
        }
        else if (object === "REDIRECCIONADO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalFn}(${num})' style='text-decoration: none;'>
                            <i class='fa fa-undo fa-lg'></i> TRAMITADO</button>`;
        }
        else if (contexto === "MENSAJE" && object === "ENVIADO REDIRECCIÓNADO" && estado_dest == 7) {
            buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'><i class='fa fa-undo fa-lg'></i> EN TRAMITE</button>";
        }
        else {
            let modalOtro = contexto === "QUEJA" ? "modalMessaQuej" : "modalVistMessa";
            buttonupdate += `<button type='button' onclick='${modalOtro}(${num})' id='btnEstado' class='btn btn'><i class='fa fa-eye fa-sm'></i> Otro</button>`;
        }
        buttonupdate += "</div>";
        return buttonupdate;
    } catch (error) {
        console.error(error);
    }
}

function openModal(objectMessage, type) {
    // Configuración según el tipo
    let config = {
        mensajes: {
            view: "views/adminView/modalMesages.html?v=3.1",
            resultFn: (num, desc) => resultMessages(num, desc),
            afterSave: () => ViewNewsMessag(),
            validate: () => {
                let desc = $("#description").val();
                if (!desc) {
                    return { valid: false, msg: "Por favor digite la respuesta, Gracias" };
                }
                return { valid: true, values: [desc] };
            }
        },
        quejas: {
            view: "views/adminView/modalQuejas.html?v=3.1",
            resultFn: (num, desc, just) => resultQueja(num, desc, just),
            afterSave: () => ViewNewsQuejas(),
            validate: () => {
                let desc = $("#description").val();
                let just = document.querySelector('input[name="justificada"]:checked');
                if (!just || !desc) {
                    return { valid: false, msg: "Por favor complete todos los campos" };
                }
                return { valid: true, values: [desc, just.value] };
            }
        }
    }[type];

    // Cargar modal dinámico
    $("#bodyTagLarge").load(config.view, function () {
        $("#titleModalLarge").text("Mensaje N° " + objectMessage["Num"] + ": " + objectMessage["Tema"])
                            .css('text-align', 'center');
        $("#lbstudent").text(objectMessage["student"]);
        $("#lbmensage").text(objectMessage["mensaje"]);

        // Botón enviar
        $("#btnModalLarge").removeAttr('disabled').removeClass('d-none').text("Enviar");

        $("#btnModalLarge").off('click').on('click', function (e) {
            e.preventDefault();
            let num_message = objectMessage["Num"];
            let validation = config.validate();

            if (!validation.valid) {
                toastr_message2(400, { "service": "Notificación", "400": validation.msg });
                return;
            }

            let actionEntry = config.resultFn(num_message, ...validation.values);
            $("#btnModalLarge").html("Ingresando <i class='fa fa-spinner fa-spin' style='font-size:24px'></i>")
                               .attr("disabled", true);

            $.when(actionEntry).done(function (response) {
                console.log(response);
                if (response["code"] == 200) {
                    $("#ModalLargeObs").modal("hide");
                    //cargartoast("Ejecución", "Se registró la respuesta correctamente");
                    config.afterSave();
                } else if (response["response"]?.["code"] == 450) {
                    alert("Su sesión ha caducado. Vuelva a ingresar, gracias");
                    location.href = "../index.html";
                }
            }).fail(function (err) {
                console.log(err);
            });

            $(".labelInvalid").removeClass("labelInvalid animated infinite pulse");
        });

        // Mostrar modal
        $("#ModalLargeObs").off("hidden.bs.modal");
        $("#ModalLargeObs").modal("show");
        $('.modal-backdrop').remove();
    });
}

function btnUpdateState(object, id, estado_dest, tipojust = "", contexto = "QUEJA") {
    try {
        var style = '" position: relative; padding: 15px 10px 30px 10px;"';
        var buttonupdate = "<div class='text-center' id='div" + id + "' style=" + style + ">";
        var num = parseInt(atob(id));

    
        //var viewFn = contexto === "QUEJA" ? "ViewNewsQuejas()" : "ViewNewsMessag()";
        var modalFn = contexto === "QUEJA" ? "modalMessaQuej" : "modalVistMessage";
        var modalTramiteFn = contexto === "QUEJA" ? "modalQuejas" : "modalVistMessage";

        if (object === "ENVIADO" || (object === "REDIRIGIDO" && estado_dest == 1) || (object === "EN TRAMITE" && estado_dest == 1)) {
            var respos = sendMessage(num)
            $.when(respos).done(function (event){
            console.log(event);
            })
            //eval(viewFn); // ejecuta la función según el contexto

            //buttonupdate += "<button type='button' id='btnEstado' class='btn btn'><i class='fa fa-eye fa-sm'></i> Enviado</button>";
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' onclick='${modalFn}(${num})' 
                            style='text-decoration: none;' id='btnEstado'>
                            <i class='fa fa-eye fa-sm'></i> CONSULTADO <br> PENDIENTE <br> POR RESPONDER</button>`;
        }
        else if (object === "CONSULTADO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' onclick='${modalFn}(${num})' 
                            style='text-decoration: none;' id='btnEstado'>
                            <i class='fa fa-eye fa-sm'></i> CONSULTADO <br> PENDIENTE <br> POR RESPONDER</button>`;
        }
        else if (object === "EN TRAMITE") {
            if (estado_dest == 7 || (contexto === "MENSAJE" && estado_dest == 4)) {
                buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' disabled id='btnEstado' style='text-decoration: none;'> <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE/<br> CERRADO</button>";
            } else {
                if (contexto === "QUEJA" && tipojust === "Justificado") {
                    buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalTramiteFn}(${num})' style='text-decoration: none;'>
                                    <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE</button>`;
                } else {
                    buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalFn}(${num})' style='text-decoration: none;'>
                                    <i class='fa fa-pen-to-square fa-lg'></i> EN TRAMITE <br> PENDIENTE <br> POR RESPONDER</button>`;
                }
            }
        }
        else if (object === "TRAMITADO") {
            buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'><i class='fa fa-check-circle fa-lg'></i> TRAMITADO</button>";
        }
        else if (object === "REDIRIGIDO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'>
                            <i class='fa fa-reply-all fa-lg'></i> REDIRIGIDO</button>`;
        }
        else if (object === "REDIRECCIONADO") {
            buttonupdate += `<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' onclick='${modalFn}(${num})' style='text-decoration: none;'>
                            <i class='fa fa-undo fa-lg'></i> TRAMITADO</button>`;
        }
        else if (contexto === "MENSAJE" && object === "ENVIADO REDIRECCIÓNADO" && estado_dest == 7) {
            buttonupdate += "<button class='btn btn-link text-dark bg-opacity-25' type='button' id='btnEstado' disabled style='text-decoration: none;'><i class='fa fa-undo fa-lg'></i> EN TRAMITE</button>";
        }
        else {
            let modalOtro = contexto === "QUEJA" ? "modalMessaQuej" : "modalVistMessa";
            buttonupdate += `<button type='button' onclick='${modalOtro}(${num})' id='btnEstado' class='btn btn'><i class='fa fa-eye fa-sm'></i> Otro</button>`;
        }
        buttonupdate += "</div>";
        return buttonupdate;
    } catch (error) {
        console.error(error);
    }
}