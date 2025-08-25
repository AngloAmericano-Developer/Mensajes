
/*/ /////////////////////////////////////////////////////////////////////////////////////////////////////////////
Modulo de Mensajes  2025
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

//Modulo de Gestion de Matricula

function moduleViews(){
    return $.ajax({
        url: '../controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"r",param:"getMain"}
    });
}
function getProfile(){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getProfile",base:"caa"}
    });
}
function getdatos(opcion,filtros="",tipos=""){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"get_datos",base:"caa",opcion,filtros,tipos}
    }); 
}

function submit_redirect(message,codig_usu,codigoProcs,tipo,envio,estado){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"submitredirect",base:"caa",message,codig_usu,codigoProcs,tipo,envio,estado}
    });

}

function buscardestOtros(destid){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getsearchdestinOtros",base:"caa",destid}
    });
    
}
function buscardest(){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getsearchdestin",base:"caa"}
    });
    
}
function getdestin(destinat){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getdestin",base:"caa",destinat}
    });
    
}


// modulo de satisfaccion 
function resultComentLider(num_message,destinatario,descripcion,restablecer){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"result_MessagesLider",base:"caa",num_message,destinatario,descripcion,restablecer}
    });
}
function gettraicingMessage(fechainicial,fechafinal,selected,tipo,seccion,nivel){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"get_TraicingMessage",base:"caa",fechainicial,fechafinal,selected,tipo,seccion,nivel}
    });
    
}
function getCoordinator(){
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getCoordinator"}
    });
}
function gettipojef(){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"get_tipo_jef",base:"caa"}
    });   
}

// Mensajes

function getMessage(tipo){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getMessage",base:"caa",tipo}
    }); 
}
function getverrespues(){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"get_ver_respuesta",base:"caa"}
    });   
}
function getContentMensaje(message){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getMessagContent",base:"caa", message:message}
    });   
}
function resultMessages(num_message,descripcion){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"result_Messages",base:"caa",num_message,descripcion}
    });
}

//Quejas
function getquejas(tipo){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getquejas",base:"caa",tipo}
    }); 
}
function resultQueja(num_message,descripcion,justificacion){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"result_Quejas",base:"caa",num_message,descripcion,justificacion}
    });
}
function update_Queja(campo,texto,message){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"updateQueja",base:"caa",campo,texto,message}
    }); 
}
function get_motivo(){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getMotivo"}
    });
}
function getQuejaContent(message){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getQuejaContent",base:"caa", message}
    });   
}
function sendMessage(num_message){
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"sendMessage", num_message}
    });
}
function redirigir(codigo,motivo){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getredirigir",base:"caa",codigo,motivo}
    });
    
}
/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function getDataMessage(type){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getDataMessage",type}
    });
}

    function getDataMessageTotal(page){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getDataMessageTotal",page}
    });
}

function ToAnswerComplaints(code){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"ToAnswerComplaints",code}
    });
}

function getTotalConsultas(){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getTotalConsultas"}
    });
}

function getPhoto(id){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"getPhoto",id}
    });
}

function updateCloseComplaints(code,codDest,TimeGestion){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"updateCloseComplaints",code,codDest,TimeGestion}
    });
}

function getGrado(){
    return $.ajax({
        url:'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {param:"getGrado",base:"caa"}
    })
}

function getFiltros(type){
    return $.ajax({
        url:'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {param:"getFiltros",base:"caa",type}
    })
}

function updateSatistaction(code){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"updateSatistaction",code}
    });
}

function saveCommentIng(code,coment){ 
    return $.ajax({
        url: 'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: {base:"caa",param:"saveCommentIng",code,coment}
    });
}

function insertFilter(filtros, page = 1, limit = 20){
    return $.ajax({
        url:'controller/cont.php',
        type: 'POST',
        dataType: 'json',
        data: { param: "insertFilter",base: "caa",filtros:filtros, page:page, limit:limit }
    });
}
   
    
   
