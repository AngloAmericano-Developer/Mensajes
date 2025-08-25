function filterModalAdmin(){
    $("#content").load("views/filterModal.html?v=1.0", async function () {
        try {
            var data = await getProfile();
            var perfil = data["response"];
            if(perfil.Perfil == 49){
                $("#reasignation-tab").addClass('active');
                $("#reasignation").addClass('show active');
            }else{
                $("#reasignation-tab").addClass('d-none');
                $("#toAnswer-tab").addClass('active');
                $("#toAnswer").addClass('show active');
            }
            fillView("all", customData = null, pagination = null, perfil);
            $(document).on("keyup", ".filtro-busqueda", function () {
                filtrarChecksearch($(this));
            });
            $(document).on("click", ".filtro-elegido", function () {
                $("#btnModalLarge").prop("disabled", false);
                $("#btncargarOtros").prop("disabled", false);
            });
            document.addEventListener("keyup", e => {
                if (e.target.matches("#search_name")) {
                    if (e.key === "Escape") e.target.value = "";
                    // SOLO EN EL NAV/PANEL ACTIVO
                    // Selecciona el contenedor activo (AJUSTA ESTE SELECTOR SEGÚN TU HTML)
                    const activeTab = document.querySelector(".tab-pane.active");
                    const cards = activeTab ? activeTab.querySelectorAll(".card") : [];
                    const filterValue = e.target.value.toLowerCase();
                    let visibleCount = 0;

                    cards.forEach(filtro => {
                        const match = filtro.textContent.toLowerCase().includes(filterValue);
                        filtro.classList.toggle("d-none", !match);
                        if (match) visibleCount++;
                    });
                    // Mostrar/ocultar mensaje SOLO para el nav activo
                    document.getElementById("mensaje-vacio").style.display = visibleCount === 0 ? "block" : "none";
                }
            });
        } catch (error) {
            
        }
    })
}

async function insertFilet() {
    try {
        const [destinatario, grado] = await Promise.all([buscardest(), getGrado()]);
        const filtros = [ { tipo: 'Proceso', elemento: 'Type-Process' },
                { tipo: 'Satisfacción', elemento: 'Type-Satistaction' },
                { tipo: 'Categoría', elemento: 'Type-Category' },
                { tipo: 'Asunto', elemento: 'Type-Affair' },
                { tipo: 'Temas', elemento: 'Type-Topics' },
                { tipo: 'Estados', elemento: 'Type-State' },
                { tipo: 'Tipo de mensaje', elemento: 'Type-Mesagge' } ];

        for (const filtro of filtros) {
            try {
                const data = await getFiltros(filtro.tipo);
                if (data && data.response) {
                createTomSelect(filtro.elemento, filtro.tipo, data.response);
                } else {
                console.warn(`No se encontraron datos para ${filtro.tipo}`);
                }
            } catch (error) {
                console.error(`Error cargando filtro ${filtro.tipo}:`, error);
            }
        }
        createSelect_ ('Filter-Grade', grado.response)
        
        $(".Filter-Grade").change(function(){
            if($(this).val() == '0'){
                createSelect_ ('Filter-Curse')
            }else{
                optionSelect($(this),'Filter-Curse')
            }
        });
        createTomSelect('Type-Destinatario', 'Destinatario', destinatario.response);
        $("#filter-button").off('click').on('click', () =>  ValidFilter());
        $(".btn-excel").off('click').on('click', () =>  exportExcel());

    } catch (error) {
        console.error(error);
    }

}

async function ValidFilter () {
    try {
        currentDataArray = [];
        customDataDataArray = [];
        var toastMessage_ = {"service":"Notifición","200":"Datos enviados", "400":"No se encontraron datos","500":"Error en el servidor tiempo de espera"};
            
        var Data = [];
        const filtros = document.querySelectorAll(".Filter");
        filtros.forEach(input => {
            // Si es un SELECT con multiple
            if (input.tagName.toLowerCase() === "select" && input.multiple) {
                const valores = Array.from(input.selectedOptions)
                                    .map(option => option.value)
                                    .filter(val => val !== "" && val !== "--");

                if (valores.length > 0) {
                    Data.push({ id: input.id, value: valores });
                }
            }
            // Si es un INPUT normal
            else if (input.value !== "" && input.value !== "--" && input.value !== undefined) {
                Data.push({ id: input.id, value: input.value });
            }
        });
       /*  console.log(Data); */
        const $btn = $("#filter-button");
        $("#screen-blocker").show();
        $btn.prop("disabled", true).removeClass("btn btn-modern btn-reassign").addClass("btn btn-primary").html(`<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Cargando... `);
        let insertData = await insertFilter(Data);

        setTimeout( async () => {
            if(insertData.code === 200) {
                $('#section_one .part_four').empty();
                fillView("four", insertData);   
            }else {
                $btn.prop("disabled", false)
                .removeClass("btn btn-primary")
                .addClass("btn btn-modern btn-reassign")
                .html(`<i class="fas fa-filter"></i> Filtrar`);
                toastr_message2(400,toastMessage_);
            }
            

        }, 1000); 
        console.log(insertData);

    
    } catch (error) {
        console.error(error);
        const $btn = $("#filter-button");
        $btn.prop("disabled", false)
            .removeClass("btn btn-primary")
            .addClass("btn btn-modern btn-reassign")
            .html(`<i class="fas fa-filter"></i> Filtrar`);
            toastr_message2(500,toastMessage_);
    }

}

function getPaginatedData(dataArray, currentPage = 1, pageSize = 50) {
    const startIndex = (currentPage - 1) * pageSize;

    // Si el índice es mayor que el largo del array, devolvemos []
    if (startIndex >= dataArray.length) return [];

    const endIndex = startIndex + pageSize;
    return dataArray.slice(startIndex, endIndex);
}

function getTotalPages(dataArray, pageSize = 50) {
    return Math.ceil(dataArray.length / pageSize);
}


async function SaveComplaintsClosed(cod_mensaje,codDest,dataArray) {
    try {
        var Tiempo = $("#date-gestion").val();
        cutomDataClosed =dataArray;
        
        
        await updateCloseComplaints(cod_mensaje,codDest,Tiempo);
        var toastMessage_ = {"service":"Notifición","200":"Datos guardados", "400":"Por favor digite todos los campos","500":"Error al guardar"};
        toastr_message2(200,toastMessage_);
        setTimeout( async () => {
        cutomDataClosed =dataArray;
        const cardInstance = new CardBody("#section_one .part_three");
        await cardInstance.addEventClick();
        const targetCard = $(`#section_one .part_three .card[data-special][data-cod="${cod_mensaje}"]`);
        if(targetCard.length) {
            targetCard.trigger('click');
        }else {
            console.warn("No hay tarjeta para hacer clic");
        }
    }, 1000); 
    } catch (error) {
        console.error(error);
    }
}

function SendSatisfaction(params){
    Swal.fire({
        title: "¿Está seguro que desea enviar?",
        showCancelButton: true,
        confirmButtonText: "Enviar",
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "btn btn-outline-info", 
            cancelButton: "btn btn-outline-danger"     
        },
        buttonsStyling: false 
    }).then(async (result) => {
        if (result.isConfirmed) {
            await updateSatistaction(params.cod_mensaje)
            setTimeout( async () => {
            const cardInstance = new CardBody("#section_one .part_three");
            await cardInstance.addEventClick();
                const targetCard = $(`#section_one .part_three .card[data-special][data-cod="${params.cod_mensaje}"]`);
            if (targetCard.length) {
                targetCard.trigger('click');
            } else {
                console.warn("No hay tarjeta para hacer clic");
            }
        }, 1000);
            
            Swal.fire("Calidicación enviada!", "", "success");
            
        } else if (result.isDenied) {
            Swal.fire("No enviado", "", "info");
        }
    });
}

function exportExcel () {
    const date = new Date();
    customDataDataArray
    const dataOriginal = customDataDataArray['response'];

    
    const data = dataOriginal.map((item, index) => ({
    "N": index + 1,
    "Numero de queja / Mensaje" : item.cod_mensaje,
    "Tipo" : item.Tipo_Mensaje,
    "Fecha envío" : item.fecha_registro,
    "Hora de envío" : item.hora_registro,
    "Mensaje" : item.mensaje,
    "Categoria " : item.justificadoTexto,
    "Asunto" : item.asunto,
    "Destinatario" : item.Destinatarios,
    "Proceso" : item.Proceso,

    "Estudiante" : item.Estudiante,
    "Código estudiante" : item.cod_estudiante,
    "Curso" : item.Curso,
    /* "Ruta" : item. */

    "Fecha y hora de revisión" : item.fecha_revisado + " " + item.hora_revisado,
    "Fecha y hora respuesta" : item.fecha_respuesta + " " + item.hora_respuesta,
    "Respuesta" : item.respuesta,
    "Motivo Queja" : item.motivo_queja == 0?'N/A':item.motivo_queja,
    /* "Comentarios Lider De Proceso" : item.*/
    "Comentarios Padre" : item.comentarios_padre,
    "Comentarios Alumno" : item.comentarios_alumno,

    "Plan Accion" : item.plan_accion,
    "Fecha Limite" : item.fecha_limite,
    "Tiempo Gestion" : item.tiempo_gestion,
    /* "Circular1" : item.*/
    "Fecha Circular1" : item.fecha_satistaccion,
    "Satisfaccion Circular1" : item.nivel_satisfaccion,
    "Comentarios Padres Circular1" : item.coment_satistaccion,
    /* "Circular2" : item.*/
    "Fecha Circular2" : item.fecha_satistaccionII,
    "Satisfaccion Circular2" : item.nivel_satisfaccionII,
    "Comentarios Padres Circular2" : item.coment_satistaccionII ,
    "Comentarios Cordinador Caidad" : item.comentCalidad,

    "Estado tramite" : item.estado_proceso
    }));

    // Crear hoja
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Crear libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mensajes");
    // Descargar Excel
    XLSX.writeFile(workbook, `mensajes_exportados_${date.toLocaleDateString()}.xlsx`);
}

