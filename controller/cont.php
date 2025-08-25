<?php 
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/funciones.php";
	require_once "$root/includes/sesion.inc";
	require_once "$root/controller/constants.php";
	require_once "queries.php";
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
	function isLoged($base_){
		try
		{
			global $db;
			if(isset($base_)){
				$return =array();
				if ($_SESSION['auth'] == "yes" || $_SESSION['id'] != null){
					$return['is_logged']=true;
					return $return; 
				}
				$return['is_logged']=false;
				return $return['is_logged'];
			}
			else{
				return array("code"=>400,"error"=>"Todos los datos son requeridos...", "is_logged"=>false);
			}
		}
		catch(Exception $e){
			return array("code"=>500,"error"=>$e, "is_logged"=>false);
		}
	}
	function get_access($base){
		try{
			if(isset($base)){			
				$access = getAccess($base);
			    return json_encode($access);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}
	function get_profile(){
		try{
			$array= array("psico"=>false,"calidad"=>false,"Perfil"=>$_SESSION["perfil"]);
			if($_SESSION["perfil"] == 52){
				$array["psico"] = true;
			}
			if($_SESSION["perfil"]== 53){
				$array["coor"] = true;
			}
			if($_SESSION["perfil"]== 49){
				$array["calidad"] = true;
			}
			return json_encode(array("code"=>200,"response"=>$array));
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}		
	}
	
	function submit_redirect($base,$message,$codig_usu,$codigoProcs,$tipo,$envio,$estado){
		try{
			if(isset($base)){				
				$reportMsg = submitredirect($base,$message,$codig_usu,$codigoProcs,$tipo,$envio,$estado);
				return json_encode($reportMsg);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}

	function getdestin($base,$destinat){

		try{

			if(isset($base)){				

				$search = getDat_Destinat($base,$destinat);

				return json_encode($search);

			}

			else{

				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));

			}

		}

		catch(Exception $e){

			return json_encode(array("code"=>500,"error"=>$e));

		}

	}

	/*/ /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Modulo de Mensajes  2025 - Mensajes
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
	function get_message($base,$tipo){
		try{
			global $db;
			if(isset($base)){	
				$base_ = $db[$base];			
				$notices = getMessage($base_,$tipo);
			    return json_encode($notices);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	function result_Messages($base_,$num_message,$descripcion){
		try
		{
			global $db;
			if(isset($base_)){
				$base = $db[$base_];
				$consultNotice = resultMessages($base,$num_message,$descripcion);
				return json_encode($consultNotice);
			}
			else{
				return array("code"=>400,"error"=>"Todos los datos son requeridos...", "is_logged"=>false);
			}
		}
		catch(Exception $e){
			return array("code"=>500,"error"=>$e, "is_logged"=>false);
		}
	}
	function get_ms($base, $message){
		try{
			global $db;
			if(isset($base) && isset($message)){			
				$base_ = $db[$base];	
				$notice = getMessageContent($base_, $message);
			    return json_encode($notice);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	function getverrespuesta($base){
		try{
			if(isset($base)){				
				$getCoordinator = get_ver_respuesta($base);
			    return json_encode($getCoordinator);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Error con la  base"));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}
	
	function getsearchdestin($base){

		try{

			if(isset($base)){				

				$search = get_Searchdestin($base);

				return json_encode($search);

			}

			else{

				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));

			}

		}

		catch(Exception $e){

			return json_encode(array("code"=>500,"error"=>$e));

		}

	}
	function getsearchdestinOtros($base,$destid){

		try{

			if(isset($base)){				

				$search = get_SearchdestinOtros($base,$destid);

				return json_encode($search);

			}

			else{

				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));

			}

		}

		catch(Exception $e){

			return json_encode(array("code"=>500,"error"=>$e));

		}

	}

	/*/ /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Modulo de Mensajes  2025 - Quejas
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
	function send_Message($base_,$num_message){
		try
		{
			global $db;
			if(isset($base_) && isset($num_message)){
				$base = $db[$base_];
				$consultNotice = sendMessage($base,$num_message);
				return json_encode($consultNotice);
			}
			else{
				return array("code"=>400,"error"=>"Todos los datos son requeridos...", "is_logged"=>false);
			}
		}
		catch(Exception $e){
			return array("code"=>500,"error"=>$e, "is_logged"=>false);
		}
	}
	function getquejas($base,$tipo){
		try{
			global $db;
			if(isset($base)){	
				$base_ = $db[$base];					
				$notices = get_Quejas($base_,$tipo);
				return json_encode($notices);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	function result_Quejas($base_,$num_message,$descripcion,$justificacion){
		try
		{
			global $db;
			if(isset($base_)){
				$base = $db[$base_];
				$consultNotice = result_Queja($base,$num_message,$descripcion,$justificacion);
				return json_encode($consultNotice);
			}
			else{
				return array("code"=>400,"error"=>"Todos los datos son requeridos...", "is_logged"=>false);
			}
		}
		catch(Exception $e){
			return array("code"=>500,"error"=>$e, "is_logged"=>false);
		}
	}
	function upd_Queja($base,$campo,$texto,$message){
		try{
			global $db;
			if(isset($base)){	
				$base_ = $db[$base];			
				$notices = updateQueja($base_,$campo,$texto,$message);
				return json_encode($notices);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	function getMotivo($base){ 

		try{
		
			if(isset($base)){
				$subject = get_Motivo($base);
				return json_encode($subject);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"problemas "));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}
	function get_msQuej($base, $message){
		try{

			if(isset($base) && isset($message)){			
		
				$notice = getMessageContentQuej($base, $message);
				return json_encode($notice);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	function getredirigir($base,$codigo,$motivo){
		try{
			global $db;
			if(isset($base)){	
				$base_ = $db[$base];			
				$notices = get_redirigir($base_,$codigo,$motivo);
				return json_encode($notices);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	/*/ /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Modulo de Mensajes  2025 - Satisfaccion
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

	function result_ComentLider($base_,$num_message,$destinatario,$descripcion,$restablecer){
		try
		{
			global $db;
			if(isset($base_)){
				$base = $db[$base_];
				$consultNotice = result_Coment_Lider($base,$num_message,$destinatario,$descripcion,$restablecer);
				return json_encode($consultNotice);
			}
			else{
				return array("code"=>400,"error"=>"Todos los datos son requeridos...", "is_logged"=>false);
			}
		}
		catch(Exception $e){
			return array("code"=>500,"error"=>$e, "is_logged"=>false);
		}
	}
	function get_Coordinator($base){
		try{
			if(isset($base)){				
				$getCoordinator = get_Coordinator_DB($base);
			    return json_encode($getCoordinator);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Error con la  base"));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}
	function gettipojef($base){ 

		try{

			if(isset($base)){			
				$subject = get_tipo_jef($base);
			    return json_encode($subject);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"problemas "));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}
	}
	function get_Traicing_Message($base_,$fechainicial,$fechafinal,$selected,$tipo,$seccion,$nivel){

		try{
			global $db;
			if(isset($base_)){				
				$base = $db[$base_];
				$reportMsg = getTraicingMessage($base,$fechainicial,$fechafinal,$selected,$tipo,$seccion,$nivel);

			    return json_encode($reportMsg);

			}

			else{

				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));

			}

		}

		catch(Exception $e){

			return json_encode(array("code"=>500,"error"=>$e));

		}

	}
	//////////////////////////////////////////////-CRISTIAN-///////////////////////////////////////
	function get_Data_Message($base,$type){
		try{
			if(isset($base)){				
				$result = getDataMessage($base,$type);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

		function get_Data_MessageTotal($base,$page){
		try{
			if(isset($base)){				
				$result = getDataMessageTotal($base,$page);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

	function ToAnswer_Complaints($base,$code){
		try{
			if(isset($base)){				
				$result = ToAnswerComplaints($base,$code);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

	function get_Total_Consultas($base){
		try{
			if(isset($base)){				
				$result = getTotalConsultas($base);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

	function get_Photo($base,$id){
		try{
			if(isset($base)){				
				$result = getPhoto($base,$id);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}
	
	function update_CloseComplaints($base,$code,$codDest,$TimeGestion){
		try{
			if(isset($base)){				
				$result = updateCloseComplaints($base,$code,$codDest,$TimeGestion);
				return json_encode($result);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

	function get_grado($base){
		try {
			if(isset($base)){
				$access = getGrado($base);
				return json_encode($access);
			}else{
				return json_encode(array("code"=>400,"error"=>"todos los datos son requeridos"));
			}
		} catch (Exception $th) {
			return json_encode(array("code" =>500,"error" =>$th->getMessage()));
		}
	}
	
	function get_Filtros($base,$type){
		try {
			if(isset($base)){
				$access = getFiltros($base,$type);
				return json_encode($access);
			}else{
				return json_encode(array("code"=>400,"error"=>"todos los datos son requeridos"));
			}
		} catch (Exception $th) {
			return json_encode(array("code" =>500,"error" =>$th->getMessage()));
		}
	}
	
	function update_Satistaction($base,$code){
		try{
			if(isset($base)){				
				$access = updateSatistaction($base,$code);
				return json_encode($access);
			}
			else{
				return json_encode(array("code"=>400,"error"=>"Todos los datos son requeridos..."));
			}
		}
		catch(Exception $e){
			return json_encode(array("code"=>500,"error"=>$e));
		}	
	}

	function insert_Filter($base,$filtros, $page, $limit){
		try {
			if(isset($base)){
				$access = insertFilter($base,$filtros, $page, $limit);
				return json_encode($access);
			}else{
				return json_encode(array("code"=>400,"error"=>"todos los datos son requeridos"));
			}
		} catch (Exception $th) {
			return json_encode(array("code" =>500,"error" =>$th->getMessage()));
		}
	}
	
	function save_CommentIng($base,$code,$coment){
		try {
			if(isset($base)){
				$access = saveCommentIng($base,$code,$coment);
				return json_encode($access);
			}else{
				return json_encode(array("code"=>400,"error"=>"todos los datos son requeridos"));
			}
		} catch (Exception $th) {
			return json_encode(array("code" =>500,"error" =>$th->getMessage()));
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////

	$base = (!isset($_FILES['base']))?'caa':$_FILES['base'];
	$userLoged = isLoged($base);

	if($userLoged['is_logged']){
			
		$base=$db[$_POST['base']];
		switch ($_POST['param']) {
		//Modulo de Gestion de Matricula
		case 'permission':
			echo get_access($base);
			break;
		case 'getProfile':
			echo get_profile();
			break;
		case 'submitredirect':
			echo submit_redirect($base,$_POST["message"],$_POST["codig_usu"],$_POST["codigoProcs"],$_POST["tipo"],$_POST["envio"],$_POST["estado"]);
			break;



				/*QUEJAS */

		case 'getquejas':
			echo getquejas($_POST['base'],$_POST['tipo']);
			break;
		case 'getdestin':
			echo getdestin($base,$_POST["destinat"]);
			break;
		case 'getsearchdestin':
			echo getsearchdestin($base);
			break;
		case 'getsearchdestinOtros':
			echo getsearchdestinOtros($base,$_POST["destid"]);
			break;
		/*SATISFACCION */
		case 'result_MessagesLider':
			echo result_ComentLider($_POST['base'],$_POST['num_message'],$_POST['destinatario'],$_POST['descripcion'],$_POST['restablecer']);	
			break;
		case 'result_Messages':
			echo result_Messages($_POST['base'],$_POST['num_message'],$_POST['descripcion']);	
			break;
		case 'get_tipo_jef':
			echo gettipojef($base);	
			break;
		case 'getCoordinator':
			echo get_Coordinator($base);
			break;
		case 'get_TraicingMessage':
			echo get_Traicing_Message($_POST["base"],$_POST["fechainicial"],$_POST["fechafinal"],$_POST["selected"],$_POST["tipo"],$_POST["seccion"],$_POST["nivel"]);
			break;

		/**MENSAJES */
		case 'getMessage':
			echo get_message($_POST['base'], $_POST['tipo']);
			break;
		case 'getMessagContent':
			echo get_ms($_POST['base'], $_POST['message']);
			break;
		case 'get_ver_respuesta':
			echo getverrespuesta($base);
			break;

		/*Quejas */
		case 'getredirigir':
			echo getredirigir($_POST['base'], $_POST['codigo'], $_POST['motivo']);
			break;
		case 'getQuejaContent':
			echo get_msQuej($base, $_POST['message']);
			break;
		case 'sendMessage':
			echo send_Message($_POST['base'],$_POST['num_message']);	
			break;
		case 'result_Quejas':
			echo result_Quejas($_POST['base'],$_POST['num_message'],$_POST['descripcion'],$_POST['justificacion']);	
			break;
		case 'getMotivo':
			echo getMotivo($base);	
			break;
		case 'updateQueja':
			echo upd_Queja($_POST['base'],$_POST['campo'],$_POST['texto'],$_POST['message']);	
			break;
		case 'getDataMessage':
			echo get_Data_Message($base,$_POST['type']);
			break;
		case 'getDataMessageTotal':
			echo get_Data_MessageTotal($base,$_POST['page']);
			break;
		case 'getTotalConsultas':
			echo get_Total_Consultas($base);
			break;
		case 'getPhoto':
			echo get_Photo($base,$_POST['id']);
			break;
		case 'ToAnswerComplaints':
			echo ToAnswer_Complaints($base,$_POST['code']);
			break;
		case 'updateCloseComplaints':
			echo update_CloseComplaints($base,$_POST['code'],$_POST['codDest'],$_POST['TimeGestion']);
			break;
		case 'getGrado':
			echo get_grado($base);
		break;
		case 'getFiltros':
			echo get_Filtros($base,$_POST['type']);
			break;
		case 'updateSatistaction':
			echo update_Satistaction($base,$_POST['code']);
			break;
		case 'insertFilter':
			$page = isset($_POST['page']) ? $_POST['page'] : 1;
			$limit = isset($_POST['limit']) ? $_POST['limit'] : 20;
			echo insert_Filter($base, $_POST["filtros"], $page, $limit);
			break;
		case 'saveCommentIng':
			echo save_CommentIng($base,$_POST['code'],$_POST['coment']);
			break;
		default:
				echo "<h1 class='animated bounce'>not param given</h1>";
			break;
		}
	}
	else{
		echo json_encode(array("response"=>array("code"=>450,"error"=>"no ha iniciado sesión o caduco","modules"=>array())));
	}
