let currentDataArray = []; 
let customDataDataArray = []; 
let cutomDataClosed = [];

class CardView {
    constructor(section,title, customData = null, pagination) {
        this.section = section;
        this.title = title;
        this.customData = customData;
        this.pagination = pagination;
        this.init();
    }
    init() {
        $(`${this.section}`).load("views/card.html", () => {
            $(this.section+ ' .spinner-overlay').removeClass('d-none');
            this.setupContent();
        })
    }

    async setupContent() {
        $(`${this.section} .tittleIcon`).append(cardTittle(this.title));
        const cardBodyInstance = new CardBody(this.section,this.customData,this.pagination);
        cardBodyInstance.init();

    }
}

class CardBody {
    constructor (Cardsection, customData = null, pagination = null) {
        this.Cardsection = Cardsection;
        this.form = null;
        this.customData  = customData;
        this.pagination = pagination;
    }
    async init () {
        try {
          let response;
          let totalMensaje;
          let code;
          let paginaActual;
          switch (this.Cardsection) {
            case "#section_one .part_one":
                response = await this.fetchData(getDataMessage,'reasignar');
                totalMensaje = this.messaggeTotal(response,'reasignar');
                this.countNumber(totalMensaje);

                await this.renderTemplete(response["response"],totalMensaje);
                if (response["response"] != undefined) {
                    await this.TempleteReassign(response["response"][0]);
                }
                
                break;
            case "#section_one .part_two":
                response = await this.fetchData(getDataMessage,'contestar');
                totalMensaje = this.messaggeTotal(response,'contestar');
                this.countNumber(totalMensaje);
                await this.renderTemplete(response["response"],totalMensaje);

                code = await this.fetchData(ToAnswerComplaints,response["response"][0].cod_mensaje);

                await this.TempleteToAnswer(code["response"]);
                break;
            case "#section_one .part_three":
                response = await this.fetchData(getDataMessage,'quejas');
                totalMensaje = this.messaggeTotal(response,'quejas');
                this.countNumber(totalMensaje);
                await this.renderTemplete(response["response"],totalMensaje);
                code = await this.fetchData(ToAnswerComplaints,response["response"][0].cod_mensaje);
                await this.TempleteComplaints(code["response"])
                break;
            case "#section_one .part_four":
                //REVISAR PORQUE NO ESTOY SEGURO
                paginaActual = this.pagination;
                
                if (this.customData || (currentDataArray.length != 0)) {
                    
                    if(this.customData != null) {
                        customDataDataArray = this.customData;
                    }
                    if (this.customData == null) {
                        this.customData = customDataDataArray;
                    }


                    totalMensaje = this.messaggeTotal(this.customData,'quejas');
                    this.countNumber(totalMensaje);

                    
                    paginaActual = (paginaActual == null)?1:paginaActual

                    var dataArray = (currentDataArray !=0 )?currentDataArray:this.customData["response"];
                    
                    let mensajesPaginados = getPaginatedData(dataArray, paginaActual);

                    await this.renderTemplete(mensajesPaginados,totalMensaje,paginaActual,dataArray);
                    code = await this.fetchData(ToAnswerComplaints,mensajesPaginados[0].cod_mensaje)
                    await this.TempleteComplaints(code["response"])
                

                } else {
                    
                    response = await this.fetchData(getTotalConsultas);
                    totalMensaje = response['response'][0];
                    
                    this.countNumber(totalMensaje);
                    var data = await this.fetchData(getDataMessageTotal,paginaActual);
                    await this.renderTemplete(data["response"],totalMensaje,paginaActual );
                    var mensaje = data["response"][0].Cod_Tipo_Mensaje;
                    code = await this.fetchData(ToAnswerComplaints,data["response"][0].cod_mensaje);
                     if (mensaje == 1 ) {
                        await this.TempleteToAnswer(code["response"])
                    } else {
                        await this.TempleteComplaints(code["response"])
                    }
                } 
                
                  
               
                break;
            default:
                console.log(`No existe plantilla ${this.Cardsection}`)
                break;
          }
        } catch (error) {
            console.error(error);
        }
    }
    countNumber(totalMensaje) {
        $(this.Cardsection+ ' .tittleIcon').append(`<div class="badges-container badge-mensajes d-flex gap-3 ms-auto align-items-center">
            <div><i class="fas fa-envelope me-2"></i>MENSAJES: <span class="badge badge-counter badge-messages">${totalMensaje.total_tipo_mensaje}</span></div>
            <div><i class="fas fa-exclamation-triangle me-2"></i>QUEJAS: <span class="badge badge-counter badge-complaints">${totalMensaje.total_tipo_quejas}</span></div>
            <div><i class="fas fa-comments me-2"></i>TOTAL MENSAJES: <span class="badge badge-counter badge-total">${totalMensaje.total_Mensajes}</span></div>
            </div>`);
    }

    async fetchData (apiFunction, ...args) {
        try {
            return await apiFunction(...args);
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }

    async renderTemplete(data,totalMensaje,pag,dataArray) {
        $(this.Cardsection+ ' .spinner-overlay').addClass('d-none');
        $(this.Cardsection + ' .bodyCard').empty().append(await createCard(this.Cardsection,data,totalMensaje,pag,dataArray));
        if (data != undefined  && data.length > 0){
            this.addEventClick(data[0].Cod_Tipo_Mensaje); 
        }
        if(this.Cardsection == "#section_one .part_four") {
            $("#modalFilter").load("views/filterMensagge.html", function (){
                insertFilet();
            });
        }
        
    }

    async loadTemplateWithSpinner({
        data,
        photoKey = "cod_estudiante",
        templateFunction
    }) {
        try {
            const $spinner = $(this.Cardsection + ' .bodyCardStudent #spinner-loading2');
            $spinner.removeClass("d-none");
            const studentCode = Array.isArray(data) ? data[0][photoKey] : data[photoKey];
            const photoResponse = await this.fetchData(getPhoto, studentCode);
            const photo = photoResponse?.response?.[0] || "";

            await templateFunction(this.Cardsection + ' .bodyCardStudent', data, photo);

        } catch (error) {
            console.error("Error cargando plantilla:", error);
        }
    }
    
    async TempleteReassign(data) {
        await this.loadTemplateWithSpinner({
            data,
            templateFunction: createCardReassing
        });
    }

    async TempleteToAnswer(data) {
        await this.loadTemplateWithSpinner({
            data,
            templateFunction: createCardToAnswer
        });
    }


    async TempleteComplaints(data) {
        await this.loadTemplateWithSpinner({
            data,
            templateFunction: createCardComplaints
        });
    }

    async TempleteProcessed(data) {
        await this.loadTemplateWithSpinner({
            data,
            templateFunction: createCardProcessed
        });
    }



    messaggeTotal(response,type){
        let Mensajes = 0;
        let Quejas = 0;
        let Total = 0;
        if (response['response'] === undefined){
            return {'total_tipo_mensaje':0,'total_tipo_quejas':0,'total_Mensajes':0}
        }
        response['response'].forEach(element => {
            if(element.Tipo_Mensaje === 'Mensaje') {
                Mensajes++;
            }
            if(element.Tipo_Mensaje === 'Queja') {
                Quejas++;
            }
            Total++;
        });
        return {'total_tipo_mensaje':Mensajes,'total_tipo_quejas':Quejas,'total_Mensajes':Total}
    }

    async addEventClick (codeMesagge) {
        try {
            const self = this;
            var select;
            switch (this.Cardsection) {
                case "#section_one .part_one":
                    select = this.Cardsection+ " .card[data-special='REDIRIGIDO']";
                    
                    $(select).off("click").click(async function(){
                        const code = $(this).data('cod');
                        const response = await self.fetchData(getDataMessage, code);
                        await self.TempleteReassign(response["response"][0]);
                    })
                    break;
                case "#section_one .part_two":
                    select = `${this.Cardsection} .card[data-special]`;
                    $(select).off("click").click(async function(){
                        const code = $(this).data('cod');
                        const response = await self.fetchData(ToAnswerComplaints, code);
                        await self.TempleteToAnswer(response["response"]);
                    })
                    break;
                case "#section_one .part_three":
                    select = `${this.Cardsection} .card[data-special]`;
                    $(select).off("click").click(async function(){
                        const code = $(this).data('cod');
                        const response = await self.fetchData(ToAnswerComplaints, code);
                        await self.TempleteComplaints(response["response"]);
                    })
                    break;

                case "#section_one .part_four":
                    select = `${this.Cardsection} .card[data-special]`;
                    $(select).off("click").click(async function(){
                        const code = $(this).data('cod');
                        const response = await self.fetchData(ToAnswerComplaints, code);
                        const type = response['response'][0].Cod_Tipo_Mensaje;
                        
                        if(response['response'][0].Cod_Tipo_Mensaje == 2){
                            await self.TempleteComplaints(response["response"]);
                        }else{
                            await self.TempleteToAnswer(response["response"]);
                        }
                    })
                    break;
            
                default:
                    break;
            }
            

        } catch (error) {
            console.error(error)
        }
    }

}

class Pagination {
    constructor(totalPages, currentPage = 1, section, dataArray) {
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.section = section;
        this.dataArray = dataArray;
    }
    render() {
        this.dataArray = this.dataArray == undefined ? currentDataArray : this.dataArray;
        
        currentDataArray = this.dataArray;
        let html = `<nav aria-label="Page navigation example" class="pagination justify-content-center pagination-sticky">
                      <ul class="pagination justify-content-center">`;
        // Botón Anterior
        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="cargarPagina(${this.currentPage - 1},'${this.dataArray}')">◄</a>
                  </li>`;

        const maxVisible = 5; // Número máximo de botones visibles entre los extremos
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(2, this.currentPage - half);
        let end = Math.min(this.totalPages - 1, this.currentPage + half);

        if (this.currentPage <= half) {
            end = Math.min(this.totalPages - 1, maxVisible);
        }

        if (this.currentPage >= this.totalPages - half) {
            start = Math.max(2, this.totalPages - maxVisible + 1);
        }

        // Página 1 siempre
        html += this.pageButton(1);

        // "..." antes del rango
        if (start > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Rango central
        for (let i = start; i <= end; i++) {
            html += this.pageButton(i);
        }

        // "..." después del rango
        if (end < this.totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        // Última página
        if (this.totalPages > 1) {
            html += this.pageButton(this.totalPages);
        }

        // Botón Siguiente
        html += `<li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="cargarPagina(${this.currentPage + 1},'${this.dataArray}')">►</a>
                 </li>`;
        html += `</ul></nav>`;
        return html;
    }

    pageButton(page) {
        const activeClass = this.currentPage === page ? 'active' : '';
        return `<li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="cargarPagina(${page},'${this.dataArray}')">${page}</a>
                </li>`;
    }
}

async function cargarPagina (page) {
    try {
        $('#section_one .part_four').empty();
        fillView("four",data = null, page ); 
    } catch (error) {
        console.error(error);
    }
}


async function SaveComment(params) {
    try {
        var toastMessage_ = {"service":"Notifición","200":"Datos enviados", "400":"Datos vacios","500":"Error"};
        var comment = $("#coment-Calidad").val();
        if(comment == "") {
            toastr_message2(400,toastMessage_);
            return
        }else {
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
                await saveCommentIng(params.cod_mensaje,comment);
                Swal.fire("Comentario agregado!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("No enviado", "", "info");
            }
        });
        }
    } catch (error) {
        console.error(error);
    }
    
}
