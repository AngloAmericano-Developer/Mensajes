


function validForm(opts){
    var valid = true;
    $.each(opts,function(index, el) {
        if(el['obligatory']){
            
            if(el['data'] !== null && el['data'] !== '' && typeof(el['data'])!== undefined){
                switch(el['type']){
                    case 'text':
                        if(el['data'] === null || el['data'].length === 0 || /^\s+$/.test(el['data'])){
                            valid=false;
                            return false;
                        }
                        break;
                    case 'number':
                        if(isNaN(el['data'])){
                            valid=false;
                            return false;
                        }
                        break;
                    case 'radio':

                        if(el['data'] === null || el['data'].length === 0 || el['data'] === ''){
                            valid=false;
                            return false;
                        }
                        break;
                    case 'select':
                        if(el['data'] === null || el['data'].length === 0 || el['data'] === '--'){
                            valid=false;
                            return false;
                        }
                        break;
                    case 'date':
                        if(el['data'] == null || el['data'].length === 0 || el['data'] === ''){
                            valid=false;
                            return false;
                        }
                        break;
                }    
            }
            else{
                valid=false;
                return false;
            }            
        }

    });
    return valid;
}

function getProfile(){
    return $.ajax({
        type:'POST',
        url:"controller/cont.php",
        dataType: 'json',
        data:{param:"getProfile",base:"caa"}
    });
}

function createTable1(id,array_,sections=false, tl=false, typeTL=1){
    /*
    this function create a dinamyc table with array object specified
    PARAMS: 
    array_ : it´s an object type JSON like this array_ = {key:{key_:value_},...}

    */
   
    var th = (sections)?"SECCIÓN":"#"
    var table = "<table class = 'table table-responsive table-sm table-hover table-bordered table-striped animated fadeIn' id='table_"+id+"' style='font-size:12px;'><thead class='thead-default text-center' ><tr><th>"+th+"</th>"
    var cont = 1;
    var style = "white-space: nowrap; ";
    $.each(array_['keys'],function(index,value){
        table = table + "<th id='title"+index+"'>"+value+"</th>";
    });
    table = table+ "</tr></thead><tbody>"
    $.each(array_,function(key,value){
        if(key != 'keys'){
            var data = (typeof(value['DATA_VAL'])!=='undefined')?btoa(value['DATA_VAL']):btoa(key);
            var dataTr = (sections)?sections_array[cont]:cont;
            style = "";
            table = table +"<tr><td class='number_' style='"+style+"'>"+dataTr+"</td>";
            $.each(value,function(key_,value_){
                if(key_ == 'PROCCESS' && tl){
                    value_ = (typeTL==1)?circle_timeLine(value_,'tl'):horizontal_timeLine(value_,'tl');
                   /* style =  style+'max-width:800px; overflow-x:auto;  position: relative; padding: 15px 0px 50px 0px;';*/
                  
                }
                else{
                    style =  style+'max-width:800px; overflow-x:auto;  position: relative; padding: 15px 0px 50px 0px;';
                }
                table = (key_ != 'DATA_VAL')? table+"<td class = 'celValue' data-val='"+data+"' data-item='"+key_+"' style='"+style+"'>"+value_+"</td>":table ;
            })
            table = table + "</tr>";
            cont +=1;
        }
    });
    var table = table+"</tbody></table>";
    return table;
}

function createAccordion(id, array_){
    var accordion = "<div id='"+id+"' role='tablist' aria-multiselectable='true' class='accordion'>";
    var card = 0;
    $.each(array_,function(key,value){
        accordion = accordion +"<div class='card'><div class='card-header' role='tab' id='heading"+card+"'>";
        accordion = accordion +"<h5 class='mb-0'>";
        accordion = accordion +"<button class='btn btn-link' data-toggle='collapse'  data-target='#collapse"+card+id+"' aria-expanded='true'>"+key+"</button></h5></div>";
        accordion = accordion +"<div id='collapse"+card+id+"' class='collapse show' role ='tabpanel' aria-labelledby='heading"+card+"'>";        
        accordion = accordion +"<div class='card-block' id='block_"+key+"'><div class='p-3'>"+value+"</div></div></div>";
        accordion = accordion +"</div>";
        card += 1;
    });
    accordion = accordion + "</div>";
    return accordion;   
}

function getDate() {
    var date = new Date();
    var year = String(date.getUTCFullYear());
    var month = ((date.getUTCMonth()+1)<10)?"0"+(date.getUTCMonth()+1):String(date.getUTCMonth()+1);
    var day = ((date.getUTCDate())<10)?"0"+(date.getUTCDate()):String(date.getUTCDate());
    var nDate = year+'-'+month+'-'+day;
    return nDate;
}

function change(object, item){
    var toastMessage_ = {"service":"actualización","200":"Mensaje actualizado", "400":"ups, hubo un error, actualiza","500":"hubo un error, intente nuevamente"};
    var array = atob($(object).parent().data('val')).split('-');
    var message = array[3];
    var value =($(object).val()!="")?$(object).val():$(object).text();
    $.ajax({
        url: host+'message/',
        type: 'PUT',
        dataType: 'json',
        data: {message: message, item:item, value:value},
        statusCode: toastr_message(toastMessage_) 
    })
    .done(function(response) {
        console.log(response);
        console.log(value);
        if(item == "STATE" ){
            if(value == 2){
                
                var data = $("td[data-item='STATE'][data-val='"+$(object).parent().data('val')+"']");
                data.children().remove();
                data.append("ENVIADO");
                var data_ans = $("td[data-item='ANSWER'][data-val='"+$(object).parent().data('val')+"']");
                var text =data_ans.children().val();
                data_ans.children().remove();
                data_ans.append(text);
            }
        }
    })
    .fail(function(response) {
        console.log(response);
    })

    
}
function alterTable(tag){
    var section = tag.split(" ");

    var content = $(tag+" td[data-item='ESTADO']");
    var assistance = $(tag+" td[data-item='asistentes']");
    var icon = $(tag+" td[data-item='ICON']");
    var color = $(tag+" td[data-item='COLOR']");
    
    if($(content).length > 0){    
        $.each(content,function(index,object){
            var state = $(this).text();
            $(this).text("");
            $(this).addClass('text-center');
            $(this).append("<i class='fa fa-pencil' aria-hidden='true' data-val='"+state+"'></i>");
        })
    }
    if($(assistance).length > 0){
        $.each(assistance,function(index,object){
            var ids = $(this).text();
            var data_val = (ids !="")?"data-val='"+ids+"'":"";
            $(this).text("");
            $(this).addClass('text-center');
            $(this).append("<i class='fa fa-bars' aria-hidden='true' "+data_val+"></i>");
        })   
    }
    if($(icon).length > 0){
        getIcon().done(function(response){
            $.each(icon,function(index,object){
                var icon_id = $(this).text().split('//');
                icon_id = icon_id[1];
                if(response['response'][icon_id-1] !== undefined){
                    $(this).text("");
                    $(this).addClass('text-center');
                    $(this).append(response['response'][icon_id-1]['description']);
                    $(this).attr('data-icon',response['response'][icon_id-1]['id']);
                }
            })
        })
    }
    if($(color).length > 0){
        $.each(color,function(index,object){
            var color = $(this).text();
            if(color !== ''){
                $(this).text("");
                $(this).addClass('text-center');
                $(this).css("background-color",color);
                $(this).attr('data-color',color);
            }
        })
    }
}
