<?php
	ini_set('max_execution_time', 300); // hasta 5 minutos
	set_time_limit(300);
	ini_set('memory_limit', '1024M');
	/**
	 * Created by PhpStorm.
	 * User: Cristian Martinez
	 * Date: 31/03/2025
	 * Time: 08:00 AM
	 *
	 * this module has all function to get OP actions
	 */

	header('Content-Type: text/html; charset=UTF-8');
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);

	/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////
														Modulo de Mensajes 2025 GESTION DE CALIDAD
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

	function response($result){
	    if (!isset($result)){
	        return array('code'=>500, 'response' => "error request");
	    } else if (empty(array_values($result))) {
	        return array('code'=>400, 'response' => "response empty");
	    } else {
	        return array('code'=>200,'response' => $result);
	    }
	}
	function cmp($a, $b){
        if(isset($a["NOMBRE"]) && isset($b["NOMBRE"])){
            return strcmp($a["NOMBRE"], $b["NOMBRE"]);
        }
	}

	function getDataMessage($base,$type) {
		try {
			$link = conectar_db($base);
			$result = [];
			$id = $_SESSION["id"];
			$filter_ = ($type == 'reasignar')?' MR.estado_mensaje = 5':(($type == 'contestar')?' MS.cod_state in(1,2)':($type == 'quejas'? ' MR.estado_mensaje in(1,2,3) and MR.tipo_asunto = 6':'MR.cod_mensaje ='.$type.' ' ));
			if($id == '3018') {
				$filter_  =$filter_.' AND U.id_grado <= 4  ';
			}elseif ($id == '120546') {
				$filter_  =$filter_.' AND U.id_grado BETWEEN 4 AND 8 ';
			}elseif ($id == '31001' || $id == '120550') {
				$filter_  =$filter_.' AND U.id_grado BETWEEN 9 AND 14 ';
			}
			$procedure = "SELECT IF(MR.tipo_asunto = 6, 'Queja', 'Mensaje') AS Tipo_Mensaje,
							MR.cod_mensaje,MR.proceso_redir AS cod_proceso_redir, MT.descripcion AS Tema,
							CONCAT(U.nombres, ' ', U.apellidos) AS Estudiante,U.id,
							CONCAT(G.abreviatura, '-', C.descripcion) AS Curso,U.id_grado as id_grado, U.curso, G.descripcion as grado,
							CONCAT(D.nombres, ' ', D.apellidos ) AS Destinatarios,
							DATE(MR.fecha_registro) AS fecha_registro,
							TIME(MR.fecha_registro) AS hora_registro, MSR.state,MP.proceso, MR.mensaje, MA.descripcion as asunto, MD.motivo,
							MS.state as estado_proceso,
							DATE(MD.fecha_revisado) AS fecha_revisado,
							TIME(MD.fecha_revisado) AS hora_revisado,
                            DATE(MD.fecha_respuesta) AS fecha_respuesta,
							TIME(MD.fecha_respuesta) AS hora_respuesta,
							MR.tipo_justificado,
                            J.tipo as justificadoTexto,
							MR.NIvel_satisfaccion AS cod_nivel_satifaccion, N.nivel_satisfacción as nivel_satisfaccion
							FROM mensajes_registrados AS MR 
							INNER JOIN mensajes_temas AS MT ON MR.Tema_mensaje = MT.id_tema 
							LEFT JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje 
							LEFT JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest
							INNER JOIN usuarios AS U ON U.id = MR.id_estudiante
							LEFT JOIN grados AS G ON U.id_grado = G.id_grado
							LEFT JOIN cursos AS C ON U.curso = C.id 
							LEFT JOIN usuarios AS D ON D.id = MD.destinatario
							INNER JOIN mensajes_estados AS MSR ON MSR.cod_state = MR.estado_mensaje 
							LEFT JOIN mensajes_procesos AS MP ON MP.cod = MT.proceso
							LEFT JOIN mensajes_asuntos AS MA ON MA.id_asunto = MT.id_asunto
							LEFT JOIN mensajes_tipo_justificacion as J ON J.cod_tipo = MR.tipo_justificado
							LEFT JOIN mensajes_nivel_satifacción AS N ON N.cod_nivel = MR.NIvel_satisfaccion
							INNER JOIN (
								SELECT cod_mensaje, MAX(MD.fecha_registro) AS ultimo_registro
								FROM mensajes_destinatarios MD
								GROUP BY cod_mensaje
							) ult ON ult.cod_mensaje = MR.cod_mensaje AND ult.ultimo_registro = MD.fecha_registro
							WHERE $filter_
							ORDER BY MR.fecha_registro ASC"; 



							
			// Ejecutar consulta
			$query = mysql_query($procedure, $link);
			
			if (mysql_num_rows($query) == 0) {
				return json_encode(array('code' => 404, 'response' => 'No se encontraron datos'));
			}
	
			// Recoger resultados
			while ($data = mysql_fetch_assoc($query)) {
				$tip_mensa = ($data["Tipo_Mensaje"]=="Mensaje")?1:2;
				

				array_push($result, array(
					"Cod_Tipo_Mensaje" => $tip_mensa,
					"Tipo_Mensaje" => $data["Tipo_Mensaje"],
					"cod_mensaje" => $data["cod_mensaje"],
					"Estudiante" => $data["Estudiante"],
					"cod_estudiante" => $data["id"],
					"id_grado" => $data["id_grado"],
					"grado" => $data["grado"],
					"Curso" => $data["Curso"],
					"fecha_registro" => $data["fecha_registro"],
					"Tema" => $data["Tema"],
					"cod_proceso_redir" => $data["cod_proceso_redir"],
					"hora_registro" => $data["hora_registro"],
					"estado" => $data["state"],
					"Destinatarios" => $data["Destinatarios"],
					"Proceso" => $data["proceso"],
					"mensaje" => $data["mensaje"],
					"asunto" => $data["asunto"],
					"motivo" => $data["motivo"],
					"estado_proceso" => $data["estado_proceso"],

					"fecha_revisado" => $data["fecha_revisado"],
					"hora_revisado" => $data["hora_revisado"],
					"fecha_respuesta" => $data["fecha_respuesta"],
					"hora_respuesta" => $data["hora_respuesta"],
					"tipo_justificado" => $data["tipo_justificado"],
					"justificadoTexto" => $data["justificadoTexto"],
					"cod_nivel_satifaccion" => $data["cod_nivel_satifaccion"],
					"nivel_satisfaccion" => $data["nivel_satisfaccion"]
				));
			}
			mysql_close($link);
			return response($result);
	
		} catch (Exception $e) {
			return json_encode(array('code' => 500, 'response' => $e->getMessage()));
		}
	}
	

	function getDataMessageTotal($base,$page) {
		try {
			$link = conectar_db($base);
			$result = [];
			$id = $_SESSION["id"];
			$type = isset($page) ? $page : 1;
			$FilterPag_ = $type * 50;
			if($id == '3018') {
				$filter_  =' WHERE U.id_grado <= 4  ';
			}elseif ($id == '120546') {
				$filter_  =' WHERE U.id_grado BETWEEN 4 AND 8 ';
			}elseif ($id == '31001' || $id == '120550') {
				$filter_  =' WHERE U.id_grado BETWEEN 9 AND 14 ';
			}else {
				$filter_ = "WHERE 1=1";
			}
			$procedure = "SELECT IF(MR.tipo_asunto = 6, 'Queja', 'Mensaje') AS Tipo_Mensaje,
							MR.cod_mensaje,MR.proceso_redir AS cod_proceso_redir, MT.descripcion AS Tema,
							CONCAT(U.nombres, ' ', U.apellidos) AS Estudiante,U.id,
							CONCAT(G.abreviatura, '-', C.descripcion) AS Curso,U.id_grado as id_grado, U.curso, G.descripcion as grado,
							CONCAT(D.nombres, ' ', D.apellidos ) AS Destinatarios,
							DATE(MR.fecha_registro) AS fecha_registro,
							TIME(MR.fecha_registro) AS hora_registro, MSR.state,MP.proceso, MR.mensaje, MA.descripcion as asunto, MD.motivo,
							MS.state as estado_proceso,
							DATE(MD.fecha_revisado) AS fecha_revisado,
							TIME(MD.fecha_revisado) AS hora_revisado,
                            DATE(MD.fecha_respuesta) AS fecha_respuesta,
							TIME(MD.fecha_respuesta) AS hora_respuesta,
							MR.tipo_justificado,
                            J.tipo as justificadoTexto,
							MR.NIvel_satisfaccion AS cod_nivel_satifaccion, N.nivel_satisfacción as nivel_satisfaccion
							FROM mensajes_registrados AS MR 
							INNER JOIN mensajes_temas AS MT ON MR.Tema_mensaje = MT.id_tema 
							LEFT JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje 
							LEFT JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest
							INNER JOIN usuarios AS U ON U.id = MR.id_estudiante
							LEFT JOIN grados AS G ON U.id_grado = G.id_grado
							LEFT JOIN cursos AS C ON U.curso = C.id 
							LEFT JOIN usuarios AS D ON D.id = MD.destinatario
							INNER JOIN mensajes_estados AS MSR ON MSR.cod_state = MR.estado_mensaje 
							LEFT JOIN mensajes_procesos AS MP ON MP.cod = MT.proceso
							LEFT JOIN mensajes_asuntos AS MA ON MA.id_asunto = MT.id_asunto
							LEFT JOIN mensajes_tipo_justificacion as J ON J.cod_tipo = MR.tipo_justificado
							LEFT JOIN mensajes_nivel_satifacción AS N ON N.cod_nivel = MR.NIvel_satisfaccion
							$filter_ 
							ORDER BY MR.fecha_registro DESC
							LIMIT 50 OFFSET $FilterPag_";
							
			// Ejecutar consulta
			$query = mysql_query($procedure, $link);
			if (mysql_num_rows($query) == 0) {
				return json_encode(array('code' => 404, 'response' => 'No se encontraron datos'));
			}
			// Recoger resultados
			while ($data = mysql_fetch_assoc($query)) {
				$tip_mensa = ($data["Tipo_Mensaje"]=="Mensaje")?1:2;
				array_push($result, array(
					"Cod_Tipo_Mensaje" => $tip_mensa,
					"Tipo_Mensaje" => $data["Tipo_Mensaje"],
					"cod_mensaje" => $data["cod_mensaje"],
					"Estudiante" => $data["Estudiante"],
					"cod_estudiante" => $data["id"],
					"id_grado" => $data["id_grado"],
					"grado" => $data["grado"],
					"Curso" => $data["Curso"],
					"fecha_registro" => $data["fecha_registro"],
					"Tema" => $data["Tema"],
					"cod_proceso_redir" => $data["cod_proceso_redir"],
					"hora_registro" => $data["hora_registro"],
					"estado" => $data["state"],
					"Destinatarios" => $data["Destinatarios"],
					"Proceso" => $data["proceso"],
					"mensaje" => $data["mensaje"],
					"asunto" => $data["asunto"],
					"motivo" => $data["motivo"],
					"estado_proceso" => $data["estado_proceso"],

					"fecha_revisado" => $data["fecha_revisado"],
					"hora_revisado" => $data["hora_revisado"],
					"fecha_respuesta" => $data["fecha_respuesta"],
					"hora_respuesta" => $data["hora_respuesta"],
					"tipo_justificado" => $data["tipo_justificado"],
					"justificadoTexto" => $data["justificadoTexto"],
					"cod_nivel_satifaccion" => $data["cod_nivel_satifaccion"],
					"nivel_satisfaccion" => $data["nivel_satisfaccion"]
				));
			}
			mysql_close($link);
			return response($result);
	
		} catch (Exception $e) {
			return json_encode(array('code' => 500, 'response' => $e->getMessage()));
		}
	}
	

	function getTotalConsultas($base){
		try {
			$link = conectar_db($base);
			$result = array();
			$id = $_SESSION["id"];
			$filter_ = "";
			$filter = "";
			if($id == '3018') {
				$filter_  =' AND U.id_grado <= 4 ';
				$filter  =' WHERE U.id_grado <= 4  ';
			}elseif ($id == '120546') {
				$filter_  =' AND U.id_grado BETWEEN 4 AND 8 ';
				$filter  =' WHERE U.id_grado BETWEEN 4 AND 8  ';
			}elseif ($id == '31001' || $id == '120550') {
				$filter_  =' AND U.id_grado BETWEEN 9 AND 14 ';
				$filter  =' WHERE U.id_grado BETWEEN 9 AND 14 ';
			}else {
				$filter = 'WHERE 1=1';
			}
			$produce = "SELECT COUNT(*) AS total_Mensajes, (SELECT COUNT(*) AS quejas FROM mensajes_registrados as m INNER JOIN usuarios as U on U.id = m.id_estudiante WHERE m.tipo_asunto = 6 $filter_) AS total_tipo_quejas, (SELECT COUNT(*) AS mensaje FROM mensajes_registrados as m INNER JOIN usuarios as U on U.id = m.id_estudiante  WHERE m.tipo_asunto != 6 $filter_) AS total_tipo_mensaje
						FROM mensajes_registrados as m INNER JOIN usuarios as U on U.id = m.id_estudiante $filter";
			$query = mysql_query($produce,$link);
			if (mysql_num_rows($query) == 0) {
				mysql_close($query);
				return json_encode(array('code' => 404, 'response' => 'No se encontraron datos'));
			}
			while ($data = mysql_fetch_assoc($query)) {
				array_push($result,array('total_Mensajes' => $data['total_Mensajes'],'total_tipo_mensaje' => $data['total_tipo_mensaje'],'total_tipo_quejas' => $data['total_tipo_quejas']));
			}
			mysql_close($query);
			return response($result);
		} catch (Exception $e) {
			return json_encode(array('code' => 500, 'response' => $e->getMessage()));
		}
	}

	function get_quejas_anter($base) {
		try {
			// Conectar a la base de datos
			$anio_pasado = date("Y") - 1;
			$link = conectar_db($base.$anio_pasado);
			mysql_set_charset('utf8', $link);
			$result = array();
			// Consulta base
			$procedure = "SELECT MT.descripcion AS Tema , MP.proceso, MR.mensaje ,MR.fecha_registro AS Fecha_Envio ,MONTH(MR.fecha_registro) AS MES,
				 CONCAT(U.apellidos,' ',U.nombres) AS Estudiante,
				CONCAT(G.abreviatura,C.descripcion) AS Curso ,CONCAT(D.apellidos,' ',D.nombres) AS Destinatario ,
				 MES.state AS estado_mensaje, MD.fecha_respuesta, MD.respuesta , 
				ME.state AS Estado_dest , MN.nivel_satisfacción AS Nivel_Satisfaccion,MJ.tipo,MR.motivo_queja, 
                MR.comentarios_padre, MR.comentarios_alumno,MR.plan_accion	, MR.fecha_limite , MR.tiempo_gestion, MR.comentarios_cordinador_calidad	 ,
				MR.estado_tramite,MR.fechaCierre,MR.CodigoQuej,U.rutam AS RUTA ,IF(MQ.motivo is null ,IF(MR.motivo_queja is null,'--',MR.motivo_queja ),MQ.motivo) as 
            motivo_queja, MC1.cod_circular AS Circular1, MC1.fecha_circular AS Fecha1, MC1.tipo_satisfaccion AS Satisfaccion1,
			  MC1.comentarios AS Comentarios1,
			MC2.cod_circular AS Circular2, MC2.fecha_circular AS Fecha2, MC2.tipo_satisfaccion AS Satisfaccion2, 
			MC2.comentarios AS Comentarios2
				FROM `mensajes_registrados` as MR
				INNER JOIN mensajes_temas AS MT ON MT.id_tema = MR.Tema_mensaje 
				LEFT JOIN message_quejasproces AS MP ON MR.proceso = MP.cod_proceso
				INNER JOIN usuarios AS U ON U.id = MR.id_estudiante
				INNER JOIN cursos AS C ON C.id = U.curso
				INNER JOIN grados AS G ON G.id_grado = U.id_grado
				INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
				INNER JOIN usuarios AS D ON D.id = MD.destinatario
				INNER JOIN mensajes_nivel_satifacción AS MN ON MN.cod_nivel = MR.NIvel_satisfaccion
				INNER JOIN mensajes_estados AS ME ON ME.cod_state=MD.estado_dest
				INNER JOIN mensajes_estados AS MES ON MES.cod_state=MR.estado_mensaje 
				LEFT JOIN mensajes_tipo_justificacion AS MJ ON MJ.cod_tipo=MR.tipo_justificado 
				LEFT JOIN mensaje_quejasmotivo AS MQ ON  MQ.id_motivo = MR.motivo_queja
                            left join mensajes_circulares AS MC1 ON MC1.cod_mensaje = MR.cod_mensaje 
            LEFT JOIN mensajes_circulares AS MC2 ON MR.cod_mensaje = MC2.cod_mensaje AND MC1.cod <> MC2.cod
				WHERE 1=1 AND MR.tipo_mensaje=2"; 

			// Imprimir la consulta para depuración
			/* echo "<pre>$procedure</pre>"; 
	 */
			// Ejecutar consulta
			$query = mysql_query($procedure, $link);
			if (!$query) {
				throw new Exception("Error en la consulta: " . mysql_error($link));
			}
	
			// Verificar si hay resultados
			if (mysql_num_rows($query) == 0) {
				return json_encode(array('code' => 404, 'response' => 'No se encontraron datos'));
			}
	
			// Recoger resultados
			while ($data = mysql_fetch_assoc($query)) {
		/* 				var_dump($data);  // Para depuración: verifica si hay datos*/
					array_push($result,array(
					"Justificado" => $data["Justificado"],
					"CodigoQueja" => $data["CodigoQueja"],
					"proceso" => $data["proceso"],
					"mes" => $data["mes"],
					"ruta" => $data["ruta"],
					"motivo_queja" => $data["motivo_queja"],
					"comentarios_padre" => $data["comentarios_padre"],
					"comentarios_alumno" => $data["comentarios_alumno"],
					"plan_accion" => $data["plan_accion"],
					"fecha_limite" => $data["fecha_limite"],
					"tiempo_gestion" => $data["tiempo_gestion"],
					"comentarios_cordinador_calidad" => $data["comentarios_cordinador_calidad"],
					"estado_tramite" => $data["estado_tramite"],
					"Circular1" => $data["Circular1"],
					"FechaCircular1" => $data["Fecha1"],
					"SatisfaccionCirc1" => $data["Satisfaccion1"],
					"ComentariosCirc1" => $data["Comentarios1"],
					"Circular2" => $data["Circular2"],
					"FechaCircular2" => $data["Fecha2"],
					"SatisfaccionCirc2" => $data["Satisfaccion2"],
					"ComentariosCirc2" => $data["Comentarios2"],
				));
			}
	
			// Cerrar conexión
			mysql_close($link);
	
			return response($result);
	
		} catch (Exception $e) {
			return array('code'=>500,'response'=>$e->getMessage());

		}
	}

	function get_Searchdestin($base){
		try{
	        $link = conectar_db($base);
	        mysql_set_charset('utf8',$link);
	        $result = array();
			$query ="SELECT DISTINCT U.id, CONCAT(U.apellidos, ' ', U.nombres) AS nombre, MP.proceso,MT.proceso as cod_proceso,
			TU.descripcion , U.id_tipo_usuario
            FROM usuarios AS U
            INNER JOIN tipo_usuario AS TU ON TU.id_tipo_usuario = U.id_tipo_usuario 
            LEFT JOIN mensajes_usuarios AS MU ON U.id = MU.usuario
			LEFT JOIN mensajes_tema_dependencias AS MTD  ON MU.cod_dependencia = MTD.dependencia
            LEFT JOIN  mensajes_temas AS MT ON MT.id_tema = MTD.cod_tema
            LEFT JOIN mensajes_procesos AS MP ON MP.cod = MT.proceso
			WHERE U.id_estado = 1 AND U.id_tipo_usuario IN (1,3,4,5,6,8,9,10,12,13,34,23)ORDER BY nombre ASC";
				$procedure = mysql_query($query, $link);
				if (mysql_num_rows($procedure) > 0) {
					while ($data = mysql_fetch_assoc($procedure)) {
						if ($data["proceso"] == null) {
							if ($data["id_tipo_usuario"] == 1 || $data["id_tipo_usuario"] == 3 || $data["id_tipo_usuario"] == 4) {
								$proceso = "Formación Académica";
								$cod = 2;
							} else if ($data["id_tipo_usuario"] == 8 || $data["id_tipo_usuario"] == 9 || $data["id_tipo_usuario"] == 10 || $data["id_tipo_usuario"] == 13 || $data["id_tipo_usuario"] == 24) {
								$proceso = "Formación en Valores";
								$cod = 3;
							} else {
								$proceso = $data["proceso"];
								$cod = $data["cod_proceso"];
							}
							
						}else{
							$proceso = $data["proceso"];
							$cod = $data["cod_proceso"];
						}
						$cod = $data["id"] . '/' . $cod;
						$descripcion = $data["nombre"] . '-' . $proceso;
						
						array_push($result, array(
							"id" => $cod,         // El ID es el id/codigo concatenado
							"description" => $descripcion
						));
					}
				}
	        mysql_close($link);
	        return response($result);
	    }
	    catch(Exception $e) {
	        $error = $e->getMessage();
	        return array('error'=>'hubo un error en el servidor','descripcion'=>$error);
	    }	
	}

	function get_SearchdestinOtros($base,$destid){
		try{
	        $link = conectar_db($base);
	        mysql_set_charset('utf8',$link);
	        $result = array();
	        $query = "SELECT U.id, CONCAT(U.apellidos, ' ', U.nombres) AS nombre, 
			TU.descripcion FROM usuarios AS U INNER JOIN tipo_usuario AS TU ON TU.id_tipo_usuario = U.id_tipo_usuario 
			WHERE U.id_estado = 1 AND U.id=$destid";

	        $procedure = mysql_query($query, $link);
	        if (mysql_num_rows($procedure) > 0) {
		        while($data = mysql_fetch_assoc($procedure)){
	            	array_push($result,array("id"=>$data["id"],"description"=>$data["nombre"]));
		        }
	        }
	        mysql_close($link);
	        return response($result);
	    }
	    catch(Exception $e) {
	        $error = $e->getMessage();
	        return array('error'=>'hubo un error en el servidor','descripcion'=>$error);
	    }	
	}
	
	function perfilUsuario($base){
		try {
			
	        $link = conectar_db($base);
	        $result =array();
	        $id = $_SESSION["id"];
	        $procedure = "SELECT id,id_perfil FROM `usuarios` WHERE id=$id"; 
	        $query = mysql_query($procedure,$link);
	        if(mysql_num_rows($query)>0){
	            while($data = mysql_fetch_assoc($query)){
					array_push($result,array("id"=>$data['id'],"id_perfil"=>$data['id_perfil']));	
	            }
	        }
	        mysql_close($link);
	        return response($result);
     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}
	function getAccess($base){
		try {
			global $modules;
	        $link = conectar_db($base);
	        $result =array();
	        $id = $_SESSION["id"];
	        $procedure = "CALL getUserAccess($id)"; 
	        $query = mysql_query($procedure,$link);
         
	        if(mysql_num_rows($query)>0){
	            while($data = mysql_fetch_assoc($query)){
	             	if(isset($modules[$data['module']])){
	             		array_push($result,$data['module']);
	             	}
	            }
	        }
	        mysql_close($link);
	        return response($result);
     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}

	/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////
														Modulo de Mensajes 2025 Modulo de Mensajes
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

	function getMessage($base,$tipo){

		try {

			$link = conectar_db($base);

			mysql_set_charset('utf8',$link);

			$result =array();

			$id = $_SESSION["id"];

			$filt= $tipo=='1'?"AND MD.estado_dest IN(1,2,3,5)":"";

			$cod=($id=="2024145" || $id=="3019")?"CONCAT(U.id,'-',U.apellidos,' ',U.nombres,' ','CURSO:',' ',G.abreviatura,' ',IF(C.descripcion IS NULL,'-',C.descripcion),' ',if(U.rutam=0 && U.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',U.rutam,' ','RUTAT: ',U.rutat)))":"CONCAT(U.apellidos,' ',U.nombres,' ','CURSO:',' ',G.abreviatura,' ',IF(C.descripcion IS NULL,'-',C.descripcion),' ',if(U.rutam=0 && U.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',U.rutam,' ','RUTAT: ',U.rutat)))";

			$procedure = "SELECT MR.cod_mensaje AS Num,$cod  AS Estudiante, UPPER(CONCAT('Padre:',P.p_apellido,'-',P.p_nombre,' Cedula Padre: ',P.num_documento,' Correo:',P.email,' Celular:',P.celular,' Tel Casa:',P.telcasa, ' Madre:',M.p_apellido,'-',M.p_nombre,' Cedula Madre: ',M.num_documento,' Correo:',M.email,' Celular:',M.celular,' Tel Casa:',M.telcasa)) as Datos,
			MR.fecha_registro  AS FechaEnvio , date_add(date_format(MR.fecha_registro, '%d/%m/%Y'),interval 3 day)  AS fechaLimite,MA.descripcion as Asunto, MT.descripcion AS Tema,MR.mensaje AS Mensaje,MR.estado_mensaje AS Estado 
			,if(MD.estado_dest=1,'--',MD.fecha_revisado) as fecha_revisado,MD.respuesta , 
			MD.fecha_respuesta,'--' as Redirigir,MD.estado_dest as EstadoDest , MS1.state AS Estado_Mensaje
							
			FROM  mensajes_registrados as MR INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje  
			INNER JOIN mensajes_temas AS MT ON MT.id_tema = MR.Tema_mensaje
			left JOIN mensajes_estados AS MS1 ON MS1.cod_state = MR.estado_mensaje
			INNER JOIN mensajes_asuntos as MA ON MA.id_asunto = MR.tipo_asunto
			INNER JOIN usuarios AS U ON U.id = MR.id_estudiante LEFT JOIN grados as G ON U.id_grado = G.id_grado 
			LEFT JOIN cursos as C ON U.curso = C.id INNER JOIN mat_papas AS P ON P.id = MR.id_estudiante 
			INNER JOIN mat_papas AS M ON M.id = MR.id_estudiante
			WHERE   MT.id_asunto != 6 AND  MD.destinatario = $id and P.tipo_papa = 1 AND M.tipo_papa = 2 $filt  ORDER BY NUM DESC LIMIT 1000";

			$query = mysql_query($procedure,$link);

			if(mysql_num_rows($query)>0){
				$result =array("keys"=>array("Redirigir a Calidad","Estudiante","Datos Estudiante","Fecha Envio","Asunto","Tema","Mensaje","Fecha Revisado","Destinatario","Respuesta","Estado"));
				while($data = mysql_fetch_assoc($query)){
					$codigo = $data['Num'];
					$destinatario = "";
					$respuesta = "";
					
					$procedure1 = "SELECT MR.cod_mensaje,  CONCAT(U.apellidos,' ', U.nombres,'-',MS.state) AS Destinatario , MD.estado_dest,MR.fecha_registro,if(MD.respuesta = '','--',MD.respuesta) as respuesta, if(MD.estado_dest =1,'--',MD.fecha_respuesta ) as fecha_respuesta
					FROM mensajes_destinatarios AS MD  
					INNER JOIN usuarios AS U ON U.id = MD.destinatario 
					left JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest 
					INNER JOIN mensajes_registrados AS MR ON MR.cod_mensaje = MD.cod_mensaje
								WHERE  MR.cod_mensaje = $codigo";

					$query1 = mysql_query($procedure1,$link);

					if(mysql_num_rows($query1)>0){
			
						while ($data1 = mysql_fetch_assoc($query1)){
							$destinatario = "Fecha Enviado "."\n".$data1['fecha_registro']."\n"." A Destinatario.. ".$data1['Destinatario']."\n";
							$respuesta = $respuesta.'Fecha   '.$data1['fecha_respuesta']."Respuesta  ".$data1['respuesta']." ";
						}							
					}						
					
					$FechaEnvio = split(" ",$data["FechaEnvio"]);
					$fechaLimite = split(" ",$data["fechaLimite"]);
					array_push($result, array("Redirigir"=>$data["Redirigir"],"NumMensaje"=>$data["Num"],"DATA_VAL"=>$data["Num"],"Estudiante"=>$data["Estudiante"],"Datos"=>$data["Datos"],
					"Fecha Envio"=>$data["FechaEnvio"],"FechaEnvio"=>$FechaEnvio[0],"fechaLimite"=>$fechaLimite[0],"Asunto"=>$data["Asunto"],"Tema"=>$data["Tema"],"Mensaje"=>$data["Mensaje"],
					"Fecha Revisado"=>$data["fecha_revisado"],"Destinatarios"=>$destinatario,"Respuesta"=>$respuesta,"Estado_Mensaje"=>$data["Estado_Mensaje"],
					"Estado"=>$data["Estado"],"estadoDest"=>$data["EstadoDest"]));

				}

			}

			mysql_close($link);

			return response($result);

		}

		catch (Exception $e) {

			$error = $e->getMessage();

			return array('code'=>500,'response'=>$error);

		}

	}
	function get_ver_respuesta($base){
		try {
			$link = conectar_db($base);
			$result =array();
			$id_person = $_SESSION["id"];
			$query_ = "CALL Actualizar_state_mensaje($id_person );";
			$query = mysql_query($query_,$link);

			if (mysql_affected_rows() > 0) {
				array_push($result,true);
			}
			else {
				array_push($result,false);
			}
			mysql_close($link);
			return response($result); 
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}
	function resultMessages($base,$num_message,$descripcion){
		try {
			$link = conectar_db($base);
			$result =array();
			$id_person = $_SESSION["id"];
			$query_ = "CALL registrar_respuesta_mensajeV1($id_person,$num_message,'$descripcion','mensaje',0);";
			$query = mysql_query($query_,$link);

			if (mysql_affected_rows() > 0) {
				while($data = mysql_fetch_assoc($query)){
					array_push($result, array("Estado"=>$data['Estado']));
				}
			}
			else {
				array_push($result,array("Estado"=>'Error'));
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}
	function getMessageContent($base,$message){
		try {
			$link = conectar_db($base);
			$result =array();
			$id = $_SESSION["id"];
		

			$message = "SELECT MR.cod_mensaje AS Num , MR.fecha_registro, MT.descripcion as Tema, MA.descripcion As Asunto , MR.mensaje, MR.estado_mensaje,
			CONCAT(S.apellidos,' ',S.nombres,' ','CURSO:',' ',G.abreviatura,C.descripcion,' ',if(S.rutam=0 && S.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',S.rutam,' ','RUTAT: ',S.rutat))) as student
			FROM mensajes_registrados AS MR INNER JOIN messages_asuntos MA ON MA.id_asunto = MR.tipo_asunto INNER JOIN mensajes_temas MT ON MT.id_tema = MR.Tema_mensaje 
			INNER JOIN usuarios AS S on S.id = MR.id_estudiante LEFT JOIN grados as G ON S.id_grado = G.id_grado LEFT JOIN cursos as C ON S.curso = C.id
			where MR.cod_mensaje=$message";
			$query = mysql_query($message,$link);
			if(mysql_num_rows($query)>0){
				while($data = mysql_fetch_assoc($query)){
					//print_r($getsubject);
					array_push($result, array("Num"=>$data['Num'],"fecha_envio"=>$data['fecha_registro'],"Tema"=>$data['Tema'],"Asunto"=>$data['Asunto'],
					"mensaje"=>$data['mensaje'],"estado"=>$data['estado_mensaje'],"student"=>$data['student']));
				}
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////
														Modulo de Mensajes 2025 Modulo de Quejas
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/


	function get_Quejas($base,$tipo){

		try {

		
			$link = conectar_db($base);
			mysql_set_charset('utf8',$link);

			$result =array();

			$id = $_SESSION["id"];
			$cod=($id=="2024145" || $id=="3019")?"CONCAT(U.id,'-',U.apellidos,' ',U.nombres,' ','CURSO:',' ',G.abreviatura,' ',IF(C.descripcion IS NULL,'-',C.descripcion),' ',if(U.rutam=0 && U.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',U.rutam,' ','RUTAT: ',U.rutat)))":"CONCAT(U.apellidos,' ',U.nombres,' ','CURSO:',' ',G.abreviatura,' ',IF(C.descripcion IS NULL,'-',C.descripcion),' ',if(U.rutam=0 && U.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',U.rutam,' ','RUTAT: ',U.rutat)))";

			$estado= $tipo==1? " AND MR.estado_mensaje  IN (1,2,3,5) AND MR.tipo_justificado !=3 AND MD.tipo_envio = 1":"";

			$procedure = "SELECT MR.cod_mensaje AS Num, $cod AS Estudiante, 
			UPPER(CONCAT('Padre:',P.p_apellido,'-',P.p_nombre,' Cedula Padre: ',P.num_documento,' Correo: ',P.email,' Celular:',P.celular,' Tel Casa:',P.telcasa, ' Madre:',M.p_apellido,'-',M.p_nombre,' Cedula Madre: ',M.num_documento,' Correo: ',M.email,' Celular:',M.celular,' Tel Casa:',M.telcasa)) as Datos,
					MR.fecha_registro AS FechaEnvio , date_add(MR.fecha_registro,interval 3 day)  AS fechaLimite,MR.mensaje AS Mensaje,ME.state AS Estado ,MD.fecha_revisado,MD.respuesta , MD.fecha_respuesta,MJ.tipo as Justificado,
					IF(MR.proceso!=0,MQP1.proceso,MQP.proceso) AS proceso,
					IF(MQM.motivo is null  , '--',MQM.motivo) as motivo,MR.comentarios_padre,MR.comentarios_alumno,
					MR.plan_accion,MR.fecha_limite,MR.tiempo_gestion as TiempoGestion,
						MR.comentarios_cordinador_calidad as cometarios_calidad ,'--' as Redirigir,MD.estado_dest as EstadoDest,MR.estado_tramite

						from mensajes_registrados as MR INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje 
						INNER JOIN mensajes_temas AS MT ON MT.id_tema = MR.Tema_mensaje
						INNER JOIN mensajes_estados AS ME ON ME.cod_state = MR.estado_mensaje
						INNER JOIN mensajes_tipo_justificacion AS MJ ON MJ.cod_tipo = MR.tipo_justificado
						INNER JOIN mensajes_asuntos AS MA ON MA.id_asunto = MR.tipo_asunto 
						INNER JOIN usuarios AS U ON U.id = MR.id_estudiante 
						LEFT JOIN grados as G ON U.id_grado = G.id_grado 
						LEFT JOIN cursos as C ON U.curso = C.id 
						INNER JOIN mat_papas AS P ON P.id = MR.id_estudiante
						INNER JOIN mat_papas AS M ON M.id = MR.id_estudiante
						
					INNER join message_quejasProces as MQP ON MQP.id_asunto = MT.id_tema
						LEFT join message_quejasProces as MQP1 ON MQP1.cod_proceso = MR.proceso
						LEFT JOIN mensaje_quejasmotivo AS MQM ON MQM.id_motivo = MR.motivo_queja

					WHERE    MR.tipo_asunto = 6  AND  MD.destinatario =  $id and P.tipo_papa = 1 AND M.tipo_papa = 2 $estado ORDER BY FechaEnvio DESC";
			$query = mysql_query($procedure,$link);

			if(mysql_num_rows($query)>0){
				if($tipo==1){//mensajes de destinatarios 
					$result =array("keys"=>array("Redirigir a Calidad","Estudiante","Mensaje","Destinatario","Respuesta","Justificado","Estado","Proceso","Motivo","Comentarios Padres","Comentarios Alumnos","Plan Acción ", "Fecha Limite"));
					while($data = mysql_fetch_assoc($query)){
						$codigo = $data['Num'];
						$destinatario = "";
						$estado = $data["Estado"];
					
						$fechaLimite = $data["fechaLimite"];
						$estudiante = 'Estudiante: <BR> '.$data["Estudiante"].'<BR><BR> Datos:<BR> '.$data["Datos"];
						$mensaje = 'Fecha Envio: '.$data["FechaEnvio"].'<BR><BR> Mensaje:<BR> '.$data["Mensaje"];
						$respuesta = 'Fecha Respuesta: '.$data["fecha_respuesta"].'<BR><BR> Respuesta: <br> '.$data["respuesta"];
						
						$comentr_padre = $data["comentarios_padre"];
						$comentr_alumn = $data["comentarios_alumno"];
						$plan = $data["plan_accion"];
						$fecha = $data["fecha_limite"];
						$estado_tramite = $data["estado_tramite"];

						$procedure1 = "SELECT MR.cod_mensaje, CONCAT(U.apellidos,' ', U.nombres,'-',MS.state) AS Destinatario, MD.fecha_registro
						FROM mensajes_destinatarios AS MD  
						INNER JOIN usuarios AS U ON U.id = MD.destinatario 
						INNER JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest 
						INNER JOIN mensajes_registrados AS MR ON MR.cod_mensaje = MD.cod_mensaje
						WHERE  MR.cod_mensaje = $codigo";
					
						$query1 = mysql_query($procedure1,$link);
					
						if(mysql_num_rows($query1)>0){
						
							while ($data1 = mysql_fetch_assoc($query1)){
								$destinatario = $destinatario.'Fecha  <br> '.$data1['fecha_registro']."<br> A Destinatario <br>".$data1['Destinatario']." <br>";
							}							
						}
						$recibido = 'Fecha Reviso:<br> '.$data["FechaEnvio"].'<BR><BR> Envio y Destinatario: <BR> '.$destinatario;
									
						array_push($result, array("Redirigir"=>$data["Redirigir"],"NumMensaje"=>$data["Num"],"DATA_VAL"=>$data["Num"],"Estudiante"=>$estudiante,
						"Mensaje"=>$mensaje,"Destinatarios"=>$recibido,"Fecha Envio"=>$data["FechaEnvio"],"fechaLimite"=>$fechaLimite[0],
							"Fecha Revisado"=>$data["fecha_revisado"],"Respuesta"=>$respuesta,
							"Fecha Respuesta"=>$data["fecha_respuesta"],"Justificado"=>$data["Justificado"],
							"Estado"=>$data["Estado"],"proceso"=>$data["proceso"],"EstadoDest"=>$data["EstadoDest"],"motivo"=>$data["motivo"],
							"comentr_padre"=>$comentr_padre,"comentr_alumn"=>$comentr_alumn,"plan"=>$plan,"fecha_limite"=>$fecha,"estado_tramite"=>$estado_tramite
						
						));
					}


				}
				else if($tipo==2){

					$result =array("keys"=>array("Estudiante","Mensaje","Destinatario","Respuesta","Justificado","Proceso","Estado"
					,"Comentarios Padres","Comentarios Alumnos","Plan Accion","Fecha limite","Motivo Queja","Timpo Gestion","Circular1","Circular2","Comentarios Cordinador","Estado de Tramite"));
					while($data = mysql_fetch_assoc($query)){
						$codigo = $data['Num'];
						$destinatario = "";
						$estado = $data["Estado"];
						$FechaEnvio = split(" ",$data["FechaEnvio"]);
						$fechaLimite = split(" ",$data["fechaLimite"]);
						$estudiante = 'Estudiante: '.$data["Estudiante"].' Datos: '.$data["Datos"];
						$mensaje = 'Fecha Envio: '.$data["FechaEnvio"].' Mensaje: '.$data["Mensaje"];
						$respuesta = 'Fecha Respuesta: '.$data["fecha_respuesta"].' Respuesta: '.$data["respuesta"];
						

						$procedure1 = "SELECT MR.cod_mensaje, CONCAT(U.apellidos,' ', U.nombres,'-',MS.state) AS Destinatario, MD.fecha_registro
							FROM mensajes_destinatarios AS MD  
								INNER JOIN usuarios AS U ON U.id = MD.destinatario 
								INNER JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest 
								INNER JOIN mensajes_registrados AS MR ON MR.cod_mensaje = MD.cod_mensaje
								WHERE  MR.cod_mensaje = $codigo";

					
						$query1 = mysql_query($procedure1,$link);
					
						if(mysql_num_rows($query1)>0){
						
							while ($data1 = mysql_fetch_assoc($query1)){
								$destinatario = $destinatario.'Fecha   '.$data1['fecharegistro']." A Destinatario ".$data1['Destinatario']." ";
							}							
						}
						
						$recibido = 'Fecha Reviso: '.$data["FechaEnvio"].' Envio y Destinatario:  '.$destinatario;		
						$circularI="0"		;
						$circular2="0"		;
						$estado_tramite=""		;
						if($data["estado_tramite"]==3){
							$estado_tramite="CERRADO";
						}else{
							$estado_tramite="--";
						}
									
						array_push($result, array("NumMensaje"=>$data["Num"],"DATA_VAL"=>$data["Num"],"Estudiante"=>$estudiante,
							"Datos"=>$data["Datos"],"Fecha Envio"=>$data["FechaEnvio"],"FechaEnvio"=>$FechaEnvio[0],"fechaLimite"=>$fechaLimite[0],"Mensaje"=>$mensaje,
							"Fecha Revisado"=>$data["fecha_revisado"],"Destinatarios"=>$recibido,"Respuesta"=>$respuesta,"Justificado"=>$data["Justificado"],
							"proceso"=>$data["proceso"],"Estado"=>$data["Estado"],"comentarios_padre"=>$data["comentarios_padre"],
							"comentarios_alumno"=>$data["comentarios_alumno"],"plan_accion"=>$data["plan_accion"],"fecha_limite"=>$data["fecha_limite"],
							"motivo"=>$data["motivo"],"TiempoGestion"=>$data["TiempoGestion"],"circularI"=>$circularI,"circular2"=>$circular2,
							"cometarios_calidad"=>$data["cometarios_calidad"],"Estado_tramite"=>$estado_tramite,"EstadoDest"=>$data["EstadoDest"]
							
						));
					}

				}
			}	
			mysql_close($link);
		
			return response($result);	
		}
		catch (Exception $e) {

			$error = $e->getMessage();
			
			return array('code'=>500,'response'=>$error);
		
		}
		

	}
	function get_redirigir($base,$codigo,$motivo){
		try {
			$link = conectar_db($base);
			mysql_set_charset('utf8',$link);
			$result =array();
			$id = $_SESSION["id"];
		
			$quejas1 = "UPDATE mensajes_destinatarios SET tipo_envio=0,estado_dest=7,fecha_respuesta=NOW(), redirigido=1,Motivo='$motivo' WHERE destinatario=$id  AND cod_mensaje =$codigo";
			$query1 = mysql_query($quejas1,$link);
			$quejas = "UPDATE mensajes_registrados SET estado_mensaje = 5 ,vist_calid=0  WHERE cod_mensaje= $codigo";
			$query = mysql_query($quejas,$link);
			
			
			if(mysql_affected_rows()>0){
				array_push($result, true);
			}
			else {
				array_push($result, false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	function sendMessage($base,$message){
		try {
			$link = conectar_db($base);
			$result =array();
			$id_person = $_SESSION["id"];
			$query_ = "CALL Actualizar_state_mensaje('$id_person','$message')";
			$query = mysql_query($query_,$link);

			if (mysql_affected_rows() > 0) {
				array_push($result,true);
			}
			else {
				array_push($result,false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}
	function result_Queja($base,$num_message,$descripcion,$justificado){
		try {
			
			$link = conectar_db($base);
			$result =array();
			$id_person = $_SESSION["id"];
			$query_ = "CALL registrar_respuesta_mensajeV1($id_person,$num_message,'$descripcion','queja',$justificado);";
			$query = mysql_query($query_,$link);

			if (mysql_affected_rows() > 0) {
				array_push($result,true);
			}
			else {
				array_push($result,false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}

	// toca revisar
	function updateQueja($base,$campo,$texto,$message){
		try {
			$link = conectar_db($base);
			mysql_set_charset('utf8',$link);
			$result =array();
			$dato_cargado=false;
			$id_person = $_SESSION["id"];

				
			if($campo=="CodigoQueja"){

				$quejas = "UPDATE mensajes_registrados SET CodigoQuej='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			
			if($campo=="motivo_queja"){

				$quejas = "UPDATE mensajes_registrados SET motivo_queja='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			if($campo=="comentr_padre"){

				$quejas = "UPDATE mensajes_registrados SET comentarios_padre='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}		
			if($campo=="comentr_alumn"){

				$quejas = "UPDATE mensajes_registrados SET comentarios_alumno='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			if($campo=="plan"){

				$quejas = "UPDATE mensajes_registrados SET plan_accion='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			if($campo=="fecha_limite"){

				$quejas = "UPDATE mensajes_registrados SET fecha_limite='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			if($campo=="txtTimepoGest"){

				$quejas = "UPDATE mensajes_registrados SET tiempo_gestion='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}

			if($campo=="txtCirc1"){
				$procedure = "SELECT DC.numero,dat_sta AS Fecha,IF(DE.estado_consu=1,IF(BE.p1 is null,'CONSULTO Y NO RESPONDIO',  IF(BE.p1='SI','SATISFECHO','NO SATISFECHO')),'NO CONSULTÓ')
				AS Satisfaccion , BE.p2 AS Comentarios FROM cvuser_comunidadvirtual.datos_circular as DC 
							INNER JOIN cvuser_comunidadvirtual.datos_envio_cir AS DE ON DE.num_circular = DC.numero 
							LEFT JOIN cvuser_comunidadvirtual.bd_extendidas AS BE ON BE.id=DE.id AND BE.circular = DE.num_circular 
				WHERE DC.data_info = 8 AND DE.num_circular = $texto and DE.id=(SELECT id_estudiante FROM mensajes_registrados WHERE cod_mensaje=$message)";
				$query = mysql_query($procedure,$link);
				
				if(mysql_num_rows($query)>0){

					while($data = mysql_fetch_assoc($query)){

						$Fecha = $data['Fecha'];
						$Satisfaccion = $data['Satisfaccion'];
						$Comentarios = $data['Comentarios'];

						$quejas = "INSERT INTO `mensajes_circulares`( `cod_mensaje`, `cod_circular`, `fecha_circular`, `tipo_satisfaccion`, `comentarios`, `tipo`) 
						VALUES ($message,$texto,'$Fecha','$Satisfaccion','$Comentarios',1)
						ON DUPLICATE KEY UPDATE 
						fecha_circular = '$Fecha',
						tipo_satisfaccion = '$Satisfaccion',
						comentarios = '$Comentarios'";
						
						$query1 = mysql_query($quejas,$link);
						if(mysql_affected_rows()>0){
							$dato_cargado=true;
						}
						else {
							array_push($result, false);
						}

					}
				}

			}
			if($campo=="txtCirc2"){
				
				$procedure = "SELECT DC.numero,dat_sta AS Fecha,IF(DE.estado_consu=1,IF(BE.p1 is null,'CONSULTO Y NO TRESPONDIO',  IF(BE.p1='SI','SATISFECHO','NO SATISFECHO')),'NO CONSULTÓ')
				AS Satisfaccion , BE.p2 AS Comentarios FROM cvuser_comunidadvirtual.datos_circular as DC 
				INNER JOIN cvuser_comunidadvirtual.datos_envio_cir AS DE ON DE.num_circular = DC.numero 
				LEFT JOIN cvuser_comunidadvirtual.bd_extendidas AS BE ON BE.id=DE.id AND BE.circular = DE.num_circular 
				WHERE DC.data_info = 8 AND DE.num_circular = $texto and DE.id=(SELECT id_estudiante FROM mensajes_registrados WHERE cod_mensaje=$message)";
				$query = mysql_query($procedure,$link);
				
				if(mysql_num_rows($query)>0){

					while($data = mysql_fetch_assoc($query)){

						$Fecha = $data['Fecha'];
						$Satisfaccion = $data['Satisfaccion'];
						$Comentarios = $data['Comentarios'];

						$quejas = "INSERT INTO `mensajes_circulares`( `cod_mensaje`, `cod_circular`, `fecha_circular`, `tipo_satisfaccion`, `comentarios`, `tipo`) 
						VALUES ($message,$texto,'$Fecha','$Satisfaccion','$Comentarios',2)
						ON DUPLICATE KEY UPDATE 
						fecha_circular = '$Fecha',
						tipo_satisfaccion = '$Satisfaccion',
						comentarios = '$Comentarios'";
						

						$query1 = mysql_query($quejas,$link);
						if(mysql_affected_rows()>0){
							$dato_cargado=true;
						}
						else {
							array_push($result, false);
						}
					}
				}
			}
			if($campo=="txtCometCalidad"){

				$quejas = "UPDATE mensajes_registrados SET comentarios_cordinador_calidad='$texto'   where cod_mensaje=$message;";
				$query = mysql_query($quejas,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}

			if($dato_cargado==true){
				$message = "SELECT MR.`cod_mensaje`,MR.CodigoQuej as CodigoQueja,	IF(MQM.motivo is null  , '--',MQM.motivo) as motivo,MR.`comentarios_padre`,MR.`comentarios_alumno`,MR.`plan_accion`,MR.`fecha_limite`,MR.`tiempo_gestion`,MR.`comentarios_cordinador_calidad`,MR.`estado_tramite`,MR.`fechaCierre`,
				MC1.cod_circular AS Circular1, MC1.fecha_circular AS Fecha1 , MC1.tipo_satisfaccion AS Satisfaccion1 , MC1.comentarios AS Comentarios1 ,MC2.cod_circular AS Circular2, MC2.fecha_circular AS Fecha2 , MC2.tipo_satisfaccion AS Satisfaccion2 , MC2.comentarios AS Comentarios2
				FROM `mensajes_registrados` AS MR
				LEFT JOIN mensaje_quejasmotivo AS MQM ON MQM.id_motivo = MR.motivo_queja
				LEFT JOIN mensajes_circulares AS MC1 ON MC1.cod_mensaje = MR.cod_mensaje 
				LEFT JOIN mensajes_circulares AS MC2 ON MC2.cod_mensaje = MR.cod_mensaje and MC1.cod <> MC2.cod
				WHERE MR.`cod_mensaje` = $message LIMIT 1";
				$query = mysql_query($message,$link);
				if(mysql_num_rows($query)>0){
					while($data = mysql_fetch_assoc($query)){
						//print_r($getsubject);
						
						$Circular1 = (empty($data['Circular1']))?'--':$data['Circular1'];
						$Fecha1 = (empty($data['Fecha1']))?'--':$data['Fecha1'];
						$Satisfaccion1 = (empty($data['Satisfaccion1']))?'--':$data['Satisfaccion1'];
						$Comentarios1 = (empty($data['Comentarios1']))?'--':$data['Comentarios1'];
						$Circular2 = (empty($data['Circular2']))?'--':$data['Circular2'];
						$Fecha2 = (empty($data['Fecha2']))?'--':$data['Fecha2'];
						$Satisfaccion2 = (empty($data['Satisfaccion2']))?'--':$data['Satisfaccion2'];
						$Comentarios2 = (empty($data['Comentarios2']))?'--':$data['Comentarios2'];

						if($id_person == "20171053"){
							array_push($result, array("id_message"=>$data['cod_mensaje'],"tiempo_gestion"=>$data['tiempo_gestion'],"comentarios_cordinador_calidad"=>$data['comentarios_cordinador_calidad'],"fechaCierre"=>$data['fechaCierre'],"plan_accion"=>$data['plan_accion'],
							"fecha_limite"=>$data['fecha_limite'],"CodigoQueja"=>$data['CodigoQueja'],
							"Circular1"=>$Circular1,"Fecha1"=>$Fecha1,"Satisfaccion1"=>$Satisfaccion1,"Comentarios1"=>$Comentarios1,
							"Circular2"=>$Circular2,"Fecha2"=>$Fecha2,"Satisfaccion2"=>$Satisfaccion2,"Comentarios2"=>$Comentarios2));						
						}else{
							array_push($result, array("cod_mensaje"=>$data['cod_mensaje'],"motivo_queja"=>$data['motivo'],"comentarios_padre"=>$data['comentarios_padre'],"comentarios_alumno"=>$data['comentarios_alumno'],"plan_accion"=>$data['plan_accion'],
							"fecha_limite"=>$data['fecha_limite']));
						}

					}
				}
			}
			
			
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}
	function get_Motivo($base){
		try {
			$link = conectar_db($base);
			mysql_set_charset('utf8',$link);
			$result =array();
			$id_person = $_SESSION["id"];
			$dato = ($id_person==140020 ||  $id_person==140098  || $id_person==2016156  || $id_person==2016244 )?1:0;
			$getclass = "SELECT id_motivo,motivo FROM mensaje_quejasmotivo";
			$query = mysql_query($getclass,$link);
			if(mysql_num_rows($query)>0){
				while($data = mysql_fetch_assoc($query)){
					//print_r($getsubject);
					array_push($result, array("id_motivo"=>$data['id_motivo'],"motivo"=>$data['motivo'],"transporte"=>$dato));
				}
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}
	function getMessageContentQuej($base, $message){
		try {
			$link = conectar_db($base);
			$result =array();
			$id = $_SESSION["id"];
			$message = "SELECT MR.cod_mensaje AS Num , MR.fecha_registro, MT.descripcion as Tema, MA.descripcion As Asunto , MR.mensaje, MR.estado_mensaje as estado,
			CONCAT(S.apellidos,' ',S.nombres,' ','CURSO:',' ',G.abreviatura,C.descripcion,' ',if(S.rutam=0 && S.rutat=0,'NO TIENE RUTA',CONCAT('RUTAM: ',S.rutam,' ','RUTAT: ',S.rutat))) as student
		FROM mensajes_registrados AS MR INNER JOIN mensajes_asuntos MA ON MA.id_asunto = MR.tipo_asunto INNER JOIN mensajes_temas MT ON MT.id_tema = MR.Tema_mensaje 
		INNER JOIN usuarios AS S on S.id = MR.id_estudiante LEFT JOIN grados as G ON S.id_grado = G.id_grado LEFT JOIN cursos as C ON S.curso = C.id
		where MR.cod_mensaje=$message ";
			$query = mysql_query($message,$link);
			if(mysql_num_rows($query)>0){
				while($data = mysql_fetch_assoc($query)){
					//print_r($getsubject);
					array_push($result, array("Num"=>$data['Num'],"fecha_envio"=>$data['fecha_registro'],"Tema"=>$data['Tema'],"Asunto"=>$data['Asunto'],
					"mensaje"=>$data['mensaje'],"estado"=>$data['estado'],"student"=>$data['student']));
				}
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////
														Modulo de Mensajes 2025 Modulo de SATISFACCION
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

	function get_tipo_jef($base){
		try {
		
			$result =array();
			$id_person = $_SESSION["id"];
			
			if($id_person == '120548'){
				array_push($result,array("tipo_jefe"=>"1"));
			}elseif($id_person == '140101'){
				array_push($result,array("tipo_jefe"=>"2"));
			}else{
				array_push($result,array("tipo_jefe"=>"3"));
			}

			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}
	}

	function result_Coment_Lider($base,$num_message,$destinatario,$descripcion,$restablecer){
		try {
			$link = conectar_db($base);
	        $result =array();
	        $id_person = $destinatario;
	        $query_ = "CALL updateComntLider($id_person,$num_message,'$descripcion',$restablecer);";
	        $query = mysql_query($query_,$link);

	        if (mysql_affected_rows() > 0) {
	        	array_push($result,true);
	        }
	        else {
	        	array_push($result,false);
	        }
	        mysql_close($link);
	        return response($result);
     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}
	//Funcion que cambia el estado a redireccionado y el tipo  del mensaje y lo devuelve a calidad
	
	function getTraicingMessage($base,$fechainicial,$fechafinal,$selected,$tipo,$seccion,$nivel){

		try {
			$id = $_SESSION["id"];
			$link = conectar_db($base);
	        mysql_set_charset('utf8',$link);
			$filtro  = "";
	        $result =array();

			$procedure1 = "SELECT id_tipo_usuario  FROM `usuarios` WHERE id=$id";

			$query1 = mysql_query($procedure1,$link);

			if(mysql_num_rows($query1)>0){

				while($data1 = mysql_fetch_assoc($query1)){
					$tipo_usuario = $data1['id_tipo_usuario'];

					$filt="";
					if ($id=='120550' or $id=='31001'or $id=='120546' or $id=='3018' or $tipo_usuario=='8' ){
						$filt=" AND G.id_grado IN  (SELECT id_grado  FROM `coordinadores_seccion` WHERE `id_cordinadora_academica` =  $id)  ";
					}else if( $tipo_usuario=='3' ){
						$filt="AND MD.destinatario IN (SELECT id_profesor  FROM cvuser_comunidadvirtual.datos_profesor where  estado=1 and tipo_prof in(2,3) and id_jefe=$id) ";
					}else if( $tipo_usuario=='10' ){
						$filt="AND MA.TIPO ='P'";
					}else {
						$filt="";
					}

					
			
					foreach ($selected as $type_users) {
						
						if($tipo==1  ){
					
					
							$procedure = "SELECT CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,CONCAT(G.abreviatura,C.descripcion ) as  curso,MR.fecha_registro AS  FechaEnvio ,MT.descripcion as Asunto,MR.mensaje AS Mensaje, MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta) as Respuesta, MS2.state AS EstadoDestinatario
							from mensajes_registrados AS MR
														INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
														INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
														INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
														INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
														INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
														INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
														LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
														LEFT JOIN cursos as C ON U2.curso = C.id
							  WHERE MR.fecha_registro>= '$fechainicial' AND MR.fecha_registro <= '$fechafinal' AND MT.tipo IN ('$type_users')  AND MR.tipo_asunto <> 6 $filt ORDER BY G.n_orden DESC ,C.id  ASC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){

									array_push($result,array("Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario));

							}

							}
						}elseif ($tipo==2) {
						
							$procedure = "SELECT CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,
							CONCAT(G.abreviatura,C.descripcion ) as  curso,MR.fecha_registro AS  FechaEnvio ,MT.descripcion as Asunto,MR.mensaje AS Mensaje,
							 MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta) as Respuesta, MS2.state AS EstadoDestinatario
							from mensajes_registrados AS MR
														INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
														INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
														INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
														INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
														INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
														INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
														LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
														LEFT JOIN cursos as C ON U2.curso = C.id
							  WHERE MR.fecha_registro>= '$fechainicial' AND MR.fecha_registro <= '$fechafinal' AND MT.tipo IN ('$type_users')  AND MR.tipo_asunto = 6 $filt ORDER BY G.n_orden DESC ,C.id  ASC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){

									array_push($result,array("Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario));

								}

							}

						}elseif($tipo==3) {

							
							$procedure = "SELECT MR.cod_mensaje, CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,IF(U2.rutam = 0,'--',U2.rutam) as Ruta,CONCAT(G.abreviatura,C.descripcion ) as  curso,MR.fecha_registro AS  FechaEnvio ,
							MT.descripcion  as Asunto,MR.mensaje AS Mensaje, MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta) as Respuesta, MS2.state AS EstadoDestinatario from mensajes_registrados AS MR
							INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
							INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
							INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
							INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
							INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
							INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
							LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
							LEFT JOIN cursos as C ON U2.curso = C.id
                            WHERE MR.fecha_registro >= '$fechainicial' AND MR.fecha_registro <= '$fechafinal' AND MD.destinatario IN ('$type_users')  AND MR.tipo_asunto <> 6  ORDER BY MR.fecha_registro  DESC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){

									array_push($result,array("id_message"=>$data['cod_mensaje'],"Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],"ruta"=>$data['Ruta'],"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario));

								}

							}

						}elseif($tipo==4) {

							
							$procedure = "SELECT MR.cod_mensaje, CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,IF(U2.rutam = 0,'--',U2.rutam) as Ruta,CONCAT(G.abreviatura,C.descripcion ) as  curso,
                            MR.fecha_registro AS  FechaEnvio ,MT.descripcion as Asunto,MR.mensaje AS Mensaje, MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta) as Respuesta, MS2.state AS EstadoDestinatario,MJ.tipo as Justificado,IF(MR.Proceso!=0,MQP1.proceso,MQP.proceso) AS proceso,
                            
							IF(MQM.motivo is null  , '--',MQM.motivo) as motivo,MR.comentarios_padre,MR.comentarios_alumno,
							 MR.plan_accion,MR.fecha_limite,MR.tiempo_gestion as TiempoGestion,
                             MC1.cod_circular as circularI,MC1.fecha_circular as fecha_circularI ,MC1.tipo_satisfaccion as satisfaccionI ,
                             MC1.comentarios as comentarios_padre_circularI,
                             
                             MC2.cod_circular as circular2,MC2.fecha_circular as fecha_circular2 ,MC2.tipo_satisfaccion as satisfaccion2,
                             MC1.comentarios as comentarios_padre_circular2, MR.comentarios_cordinador_calidad as cometarios_calidad
							
                            from mensajes_registrados AS MR
											INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
												LEFT join message_quejasProces as MQP1 ON MQP1.cod_proceso = MR.proceso
												LEFT JOIN message_quejasProces AS MQP ON MQP.id_asunto = MR.Tema_mensaje
												LEFT JOIN mensaje_quejasmotivo AS MQM ON MQM.id_motivo = MR.motivo_queja
												INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
												INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
												INNER JOIN mensajes_tipo_justificacion AS MJ ON MJ.cod_tipo = MR.tipo_justificado												
												INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
												INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
												INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
                                                LEFT JOIN mensajes_circulares as  MC1 ON MC1.cod_mensaje = MR.cod_mensaje and MC1.tipo = 1
                                                LEFT JOIN mensajes_circulares as  MC2 ON MC2.cod_mensaje = MR.cod_mensaje and MC2.tipo = 2
												LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
												LEFT JOIN cursos as C ON U2.curso = C.id
                                                	WHERE MR.fecha_registro >= '$fechainicial'  AND MR.fecha_registro <= '$fechafinal' AND MD.destinatario IN ('$type_users')  AND MR.tipo_asunto = 6  ORDER BY MR.fecha_registro  DESC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){

									array_push($result,array("id_message"=>$data['cod_mensaje'],"Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],"ruta"=>$data['Ruta'],"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario,"Justificado"=>$data['Justificado'],"motivo"=>$data['motivo']));

								}

							}

						}elseif($tipo==5){
							$grado = "";
							if($seccion=="pre"){
								$grado  = "AND U2.id_grado IN (1,2,3)";
							}elseif ($seccion=="pri"){
								$grado = "AND U2.id_grado IN (4,5,6,7,8)";
							}elseif($seccion=="bto"){
								$grado = "AND U2.id_grado IN (9,10,11,12,13,14)";
							}else{
								$grado ="";
							}
							
							$nivelSat = $nivel==1 || $nivel=="1"? "AND MR.NIvel_satisfaccion IN (4,5)":"";

							$procedure = "SELECT CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,
							CONCAT(G.abreviatura,C.descripcion ) as  curso,MR.fecha_registro AS  FechaEnvio ,MT.descripcion as Asunto,MR.mensaje AS Mensaje,
							 MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta)
							  as Respuesta, MS2.state AS EstadoDestinatario,  MN.nivel_satisfacción
							from mensajes_registrados AS MR
														INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
														INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
														INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
														INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
														INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
														INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
														INNER JOIN mensajes_nivel_satifacción AS MN ON MN.cod_nivel = MR.NIvel_satisfaccion 
														LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
														LEFT JOIN cursos as C ON U2.curso = C.id
							  WHERE MR.fecha_registro>= '$fechainicial' AND MR.fecha_registro <= '$fechafinal' $nivelSat AND MT.tipo IN ('$type_users') $grado  AND MR.tipo_asunto <> 6 $filt ORDER BY G.n_orden DESC ,C.id  ASC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){
									$nivel = $data['nivel_satisfacción'];
									$nivelsatisfaccion ="";
									if($nivel=='NA'){
										$nivelsatisfaccion = "Pendiente respuesta <br> del destinatario";
									}else if($nivel=='Activo'){
										$nivelsatisfaccion = "Sin respuesta";
									}else{
										$nivelsatisfaccion= $data['nivel_satisfacción'];
									}


									array_push($result,array("Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],
									"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario,"nivelsatisfaccion"=>$nivelsatisfaccion));

							}

							}
						}elseif($tipo==6){

							
							$grado = "";
							if($seccion=="pre"){
								$grado  = "AND U2.id_grado IN (1,2,3)";
							}elseif ($seccion=="pri"){
								$grado = "AND U2.id_grado IN (4,5,6,7,8)";
							}elseif($seccion=="bto"){
								$grado = "AND U2.id_grado IN (9,10,11,12,13,14)";
							}else{
								$grado ="";
							}
							$nivelSat = $nivel==1 || $nivel=="1"? "AND MR.NIvel_satisfaccion IN (4,5)":"";

							$procedure = "SELECT CONCAT(U1.apellidos,' ' , U1.nombres) AS Destinatario, CONCAT(U2.apellidos,' ' , U2.nombres) AS Estudiante,
							CONCAT(G.abreviatura,C.descripcion ) as  curso,MR.fecha_registro AS  FechaEnvio ,MT.descripcion as Asunto,MR.mensaje AS Mensaje, MN.nivel_satisfacción,
							 MS1.state AS estado,IF(MD.fecha_respuesta = '','--',MD.fecha_respuesta) as FechaRespuesta,IF(MD.respuesta = '','--',MD.respuesta) as Respuesta, MS2.state AS EstadoDestinatario
							from mensajes_registrados AS MR
														INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
														INNER JOIN usuarios as U1 ON U1.id = MD.destinatario
														INNER JOIN usuarios as U2 ON U2.id = MR.id_estudiante
														INNER JOIN mensajes_temas as MT ON MT.id_tema = MR.Tema_mensaje
														INNER JOIN message_state as MS1 ON MS1.cod_state = MR.estado_mensaje
														INNER JOIN message_state as MS2 ON MS2.cod_state = MD.estado_dest 
														INNER JOIN mensajes_nivel_satifacción AS MN ON MN.cod_nivel = MR.NIvel_satisfaccion 
														LEFT JOIN grados as G ON U2.id_grado = G.id_grado 
														LEFT JOIN cursos as C ON U2.curso = C.id
							  WHERE MR.fecha_registro>= '$fechainicial' AND MR.fecha_registro <= '$fechafinal' $nivelSat AND MT.tipo IN ('$type_users') $grado AND MR.tipo_asunto = 6 $filt ORDER BY G.n_orden DESC ,C.id  ASC";
							$query = mysql_query($procedure,$link);
							if(mysql_num_rows($query)>0){

								while($data = mysql_fetch_assoc($query)){
									$nivel = $data['nivel_satisfacción'];
									$nivelsatisfaccion ="";
									if($nivel=='NA'){
										$nivelsatisfaccion = "Pendiente respuesta <br> del destinatario";
									}else if($nivel=='Activo'){
										$nivelsatisfaccion = "Sin respuesta";
									}else{
										$nivelsatisfaccion= $data['nivel_satisfacción'];
									}

									array_push($result,array("Destinatario"=>$data['Destinatario'],"Estudiante"=>$data['Estudiante'],
									"Curso"=>$data['curso'],"FechaEnvio"=>$data['FechaEnvio'],"Asunto"=>$data['Asunto'],"Mensaje"=>$data['Mensaje'],
									"estado"=>$data['estado'],"FechaRespuesta"=>$data['FechaRespuesta'],"Respuesta"=>$data['Respuesta'],
									"EstadoDestinatario"=>$data['EstadoDestinatario'],"tipoUsuario"=>$tipo_usuario,"nivelsatisfaccion"=>$nivelsatisfaccion));

								}

							}

						}
				
					}
				}
			}

	        mysql_close($link);

	        return response($result);

     	}

     	catch (Exception $e) {

        	$error = $e->getMessage();

         	return array('code'=>500,'response'=>$error);

     	}

	}
	function get_Coordinator_DB($base){
        try{
            $link = conectar_db($base);
            mysql_set_charset('utf8',$link);
            //$id = $_SESSION["id"];
            $response = array();
            $sql= "SELECT R.id, CONCAT(U.nombres,' ',U.apellidos) AS nombre, R.rutas FROM usuarios AS U INNER JOIN ruta_coordinadora AS R ON U.id = R.id WHERE U.id_perfil = 11 UNION
			SELECT U.id ,CONCAT(U.nombres,' ',U.apellidos) AS nombre, '' as rutas FROM usuarios AS U where id=140020";
            $getcoordinator = mysql_query($sql,$link);
            if (mysql_num_rows($getcoordinator) > 0) {
                while ($result = mysql_fetch_assoc($getcoordinator)) {
                    $c_id = $result['id'];
                    $names = $result['nombre'];
                    //$route = $result['rutas'];
            
                  
           
                    //print_r('route');
                    //print_r($route);
                    array_push($response,array('id' => $c_id,'names' => $names));
                }
            }
            mysql_close($link);
            return response($response);
        }catch(Exception $e){
            $error=$e->getMessage();
            return array('code'=>500,'response'=>$error);
        }
    }

	function getPhoto($base,$idStudent){
		try {
	        $link = conectar_db($base);
	        $result =array();
			$procedure = "SELECT * FROM `fotos` WHERE `id` LIKE '$idStudent'"; 
	        $query = mysql_query($procedure,$link);
			if(mysql_num_rows($query) > 0){
				while($data = mysql_fetch_assoc($query)){
					array_push($result, array("id" => $data["id"],"foto" => base64_encode($data["foto"])));
				}
				mysql_close($link);
				return response($result);
			}else{
				$data_result = false;
				return $data_result;
			}

     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}

	function submitredirect($base,$message,$codig_usu,$codigoProcs,$tipo,$envio,$estado){
		try {
	        $result =array();
	        $link = conectar_db($base);
	        mysql_set_charset('utf8',$link);
			if ($tipo==1){
				$query_ = "CALL redireccion_mensajes($message,$codigoProcs,$codig_usu,$tipo,$estado);";
				$query = mysql_query($query_,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}elseif ($tipo==3) {
				$procedure1 = "INSERT INTO `mensajes_destinatarios`(`cod_mensaje`, `destinatario`, `tipo_envio`,  `estado_dest`,`fecha_registro`) 
				VALUES ($message,$codig_usu,$tipo,$estado,NOW())";
				$query = mysql_query($procedure1,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}elseif ($tipo==4) {
				$procedure = "UPDATE `mensajes_registrados` SET `estado_mensaje`= 6   WHERE `cod_mensaje`=  $message ";
				$query = mysql_query($procedure,$link);
				$procedure1 = "INSERT INTO `mensajes_destinatarios`(`cod_mensaje`, `destinatario`, `tipo_envio`, `estado_dest`,`fecha_registro`) 
				VALUES ($message,$codig_usu,$tipo,$estado,NOW())";
				$query = mysql_query($procedure1,$link);
				if(mysql_affected_rows()>0){
					$dato_cargado=true;
				}
				else {
					array_push($result, false);
				}
			}
			if($dato_cargado==true){
				$procedure = "SELECT DISTINCT MR.cod_mensaje ,MS.state as estado,IF(MR.proceso!=0,MQP1.proceso,MQP.proceso) AS proceso
					from mensajes_registrados AS MR
					INNER JOIN usuarios AS U ON MR.id_estudiante=U.id 
					LEFT JOIN grados as G ON U.id_grado = G.id_grado 
					LEFT JOIN cursos as C ON U.curso = C.id 
					INNER JOIN mensajes_temas AS MT ON MR.Tema_mensaje = MT.id_tema 
					INNER JOIN mensajes_asuntos AS MA ON MA.id_asunto = MR.tipo_asunto
					INNER JOIN mensajes_estados AS MS ON MS.cod_state = MR.estado_mensaje
					INNER JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje
					INNER join message_quejasProces as MQP ON MQP.id_asunto = MT.id_tema
					LEFT join message_quejasProces as MQP1 ON MQP1.cod_proceso = MR.proceso
					LEFT JOIN mensaje_quejasmotivo AS MQM ON MQM.id_motivo = MR.motivo_queja
					INNER JOIN mat_papas AS P ON P.id = MR.id_estudiante 
					INNER JOIN mat_papas AS M ON M.id = MR.id_estudiante
					WHERE    P.tipo_papa = 1 AND M.tipo_papa = 2  AND MR.cod_mensaje= $message  ORDER BY  MD.tipo_envio  ASC, MR.cod_mensaje  DESC";
					$query = mysql_query($procedure,$link);
					if(mysql_num_rows($query)>0){

						while($data = mysql_fetch_assoc($query)){
						
							$destinatario = "";
							$fecharevisado = "";
							$respuesta = "";
							$fecharespuesta="";
							$estado="";

							$procedure1 ="SELECT MR.cod_mensaje, CONCAT(U.nombres,' ',U.apellidos) AS destinatario,MS.state as Estado,MD.fecha_revisado AS fechRevisado, MD.respuesta ,
							 MD.fecha_respuesta ,MD.motivo, MT.iniciales as Ini
							FROM mensajes_destinatarios AS MD INNER JOIN usuarios AS U ON U.id = MD.destinatario 
							INNER JOIN mensajes_registrados AS MR ON MR.cod_mensaje = MD.cod_mensaje 
							INNER JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest
							INNER JOIN mensajes_tipo_dest AS MT ON MT.id_tipo = MD.tipo_envio 
							WHERE  MR.cod_mensaje =  $message ";



							$query1 = mysql_query($procedure1,$link);

							if(mysql_num_rows($query1)>0){
		
								while ($data1 = mysql_fetch_assoc($query1)){
								
									$destinatario = $destinatario.$data1['destinatario']."(".$data1['Ini'].")  ".$data1['Estado']."  <br>";
									$fecharevisado = $fecharevisado.$data1['fechRevisado']."(".$data1['Ini'].") <br>";
									$respuesta = $respuesta.$data1['respuesta']."(".$data1['Ini'].") <br>";
									$fecharespuesta = $fecharespuesta.$data1['fecha_respuesta']."(".$data1['Ini'].") <br>";
									if($data['estado']=="REDIRIGIDO"){
										$estado=$data['estado']."<br> Motivo:".$data1['Motivo']." ";
									}else{
										$estado=$data['estado'];
									}		
									
								}		
											
							}
							

							array_push($result,array("id_message"=>$data['cod_mensaje'],"Destinatario"=>$destinatario,"fecharevisado"=>$fecharevisado,
							"respuesta"=>$respuesta,"fecharespuesta"=>$fecharespuesta,"estado_mensaje"=>$data['estado'],"Estado"=>$estado,"proceso"=>$data['proceso'],"envio"=>$data['envio']));

						}

					}
			}
			mysql_close($link);
			return response($result); 
     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}

	function ToAnswerComplaints($base,$code) {
		try {
			$link = conectar_db($base);
			$result = [];
			$procedure = "SELECT IF(MR.tipo_asunto = 6, 'Queja', 'Mensaje') AS Tipo_Mensaje,
							MR.cod_mensaje,MR.proceso_redir AS cod_proceso_redir, MT.descripcion AS Tema,
							CONCAT(U.nombres, ' ', U.apellidos) AS Estudiante,
                            U.id,
							CONCAT(G.abreviatura, '-', C.descripcion) AS Curso,
							CONCAT(D.nombres, ' ', D.apellidos ) AS Destinatarios,
							DATE(MR.fecha_registro) AS fecha_registro,               
							TIME(MR.fecha_registro) AS hora_registro,
							DATE(MD.fecha_revisado) AS fecha_revisado,
							TIME(MD.fecha_revisado) AS hora_revisado,
                            DATE(MD.fecha_registro) AS fecha_envio_aProfe,
							TIME(MD.fecha_registro) AS hora_envio_aProfe, 
                            DATE(MD.fecha_respuesta) AS fecha_respuesta,
							TIME(MD.fecha_respuesta) AS hora_respuesta,              
                            MSR.state,
                            MP.proceso,
                            MR.mensaje,
                            MA.descripcion as asunto,
                            MD.motivo,
                            MS.state as estado_proceso,
							MD.estado_dest,
							MP2.proceso as proceso1,
							MD.respuesta,
							MR.tipo_justificado,
                            J.tipo as justificadoTexto,
							MR.comentarios_padre,
							MR.comentarios_alumno,
							MR.plan_accion,
							DATE(MR.fecha_limite) AS fecha_limite,
							TIME(MR.fecha_limite) AS hora_limite,
							MR.motivo_queja,
							MD.cod_destinatario,
							MR.NIvel_satisfaccion AS cod_nivel_satifaccion, 
							N.nivel_satisfacción as nivel_satisfaccion,
							MR.fecha_satistaccion,
							MR.coment_satistaccion,
                            MR.NIvel_satisfaccionII AS cod_nivel_satifaccionII,
                            NII.nivel_satisfacción as nivel_satisfaccionII,
                            MR.fecha_satistaccionII,
							MR.coment_satistaccionII,
							IF(MQM.motivo is null ,IF(MR.motivo_queja is null,'--',MR.motivo_queja ),MQM.motivo) AS motivo_queja,
							MR.comentarios_cordinador_calidad
							FROM mensajes_registrados AS MR 
							INNER JOIN mensajes_temas AS MT ON MR.Tema_mensaje = MT.id_tema 
							LEFT JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje 
                            LEFT JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest
							INNER JOIN usuarios AS U ON U.id = MR.id_estudiante
							LEFT JOIN grados AS G ON U.id_grado = G.id_grado
							LEFT JOIN cursos AS C ON U.curso = C.id 
							LEFT JOIN usuarios AS D ON D.id = MD.destinatario
							INNER JOIN mensajes_estados AS MSR ON MSR.cod_state = MR.estado_mensaje 
                            LEFT JOIN mensajes_procesos AS MP ON MP.cod = MD.proceso
							LEFT JOIN mensajes_asuntos AS MA ON MA.id_asunto = MT.id_asunto
                            LEFT JOIN mensajes_procesos AS MP2 ON MP2.cod = MT.proceso
							LEFT JOIN mensajes_tipo_justificacion as J ON J.cod_tipo = MR.tipo_justificado
							LEFT JOIN mensajes_nivel_satifacción AS N ON N.cod_nivel = MR.NIvel_satisfaccion
                            LEFT JOIN mensajes_nivel_satifacción AS NII ON NII.cod_nivel = MR.NIvel_satisfaccionII
							LEFT JOIN mensaje_quejasmotivo AS MQM ON MQM.id_motivo = MR.motivo_queja
                            WHERE  MR.cod_mensaje = $code
							ORDER BY MD.cod_destinatario ASC";
							
			// Ejecutar consulta
			$query = mysql_query($procedure, $link);
			
			if (mysql_num_rows($query) == 0) {
				return json_encode(array('code' => 404, 'response' => 'No se encontraron datos'));
			}
	
			// Recoger resultados
			while ($data = mysql_fetch_assoc($query)) {
				$tip_mensa = ($data["Tipo_Mensaje"]=="Mensaje")?1:2;
				

				array_push($result, array(
					"Cod_Tipo_Mensaje" => $tip_mensa,
					"Tipo_Mensaje" => $data["Tipo_Mensaje"],
					"cod_mensaje" => $data["cod_mensaje"],
					"Estudiante" => $data["Estudiante"],
					"cod_estudiante" => $data["id"],
					
					"Curso" => $data["Curso"],
					"fecha_registro" => $data["fecha_registro"],
					"Tema" => $data["Tema"],
					"cod_proceso_redir" => $data["cod_proceso_redir"],
					"hora_registro" => $data["hora_registro"],
					"estado" => $data["state"],
					"Destinatarios" => $data["Destinatarios"],
					"Proceso" => $data["proceso"],
					"mensaje" => $data["mensaje"],
					"asunto" => $data["asunto"],
					"motivo" => $data["motivo"],
					"estado_proceso" => $data["estado_proceso"],
					"estado_dest" => $data["estado_dest"],
					"fecha_revisado" => $data["fecha_revisado"],
					"hora_revisado" => $data["hora_revisado"],
					"fecha_respuesta" => $data["fecha_respuesta"],
					"hora_respuesta" => $data["hora_respuesta"],
					"Proceso1" => $data["proceso1"],
					"respuesta" => $data["respuesta"],
					"tipo_justificado" => $data["tipo_justificado"],
					"justificadoTexto" => $data["justificadoTexto"],
					"cod_nivel_satifaccion" => $data["cod_nivel_satifaccion"],
					"nivel_satisfaccion" => $data["nivel_satisfaccion"],
					"comentarios_padre" => $data["comentarios_padre"],
					"comentarios_alumno" => $data["comentarios_alumno"],
					"plan_accion" => $data["plan_accion"],
					"fecha_limite" => $data["fecha_limite"],
					"hora_limite" => $data["hora_limite"],
					"motivo_queja" => $data["motivo_queja"],
					"cod_destinatario" => $data["cod_destinatario"],
					"fecha_satistaccion" => $data["fecha_satistaccion"],
					"coment_satistaccion" => $data["coment_satistaccion"],
					"cod_nivel_satifaccionII" => $data["cod_nivel_satifaccionII"],
					"nivel_satisfaccionII" => $data["nivel_satisfaccionII"],
					"fecha_satistaccionII" => $data["fecha_satistaccionII"],
					"coment_satistaccionII" => $data["coment_satistaccionII"],
					"coment_calidad" => $data["comentarios_cordinador_calidad"]
				));
			}
			mysql_close($link);
			return response($result);
	
		} catch (Exception $e) {
			return json_encode(array('code' => 500, 'response' => $e->getMessage()));
		}
	}
	/*/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* TENER EN CUENTA ESTA CONSULTA PORQUE EL FILTRO AL PARECER ESTA MAL */
	function getDat_Destinat($base,$destinat){
		try {
	        $link = conectar_db($base);
	        mysql_set_charset('utf8',$link);
	        $result =array();
	        $procedure = "SELECT MD.tipo_envio AS destin ,Concat(U.nombres,' ',U.apellidos) as usuario , MD.tipo_envio  from  mensajes_destinatarios 
			AS MD INNER JOIN usuarios as U ON U.id = MD.destinatario WHERE MD.cod_mensaje= $destinat "; /* AND MD.tipo_envio IN (1,3,4,5,6,8,9,10,12,13)  */ 
	        $query = mysql_query($procedure,$link);
	        if(mysql_num_rows($query)>0){
	            while($data = mysql_fetch_assoc($query)){
					array_push($result,array("destin"=>$data['destin'],"usuario"=>$data['usuario'],"tipo"=>$data['tipo']));
	            }
	        }
	        mysql_close($link);
	        return response($result);
     	}
     	catch (Exception $e) {
        	$error = $e->getMessage();
         	return array('code'=>500,'response'=>$error);
     	}
	}

	function updateCloseComplaints($base,$code,$codDest,$TimeGestion){
		try {
			$link = conectar_db($base);
			$result =array();
			$id = $_SESSION["id"];
			$process = "UPDATE mensajes_registrados SET estado_mensaje = 4 ,fechaCierre = CURDATE(), tiempo_gestion = '$TimeGestion'  WHERE cod_mensaje= $code";
			$process2 = "UPDATE mensajes_destinatarios SET estado_dest = 4 WHERE cod_destinatario = $codDest  AND estado_dest <> 7 ";
			$query = mysql_query($process,$link);
			$query2 = mysql_query($process2,$link);
			
			
			if(mysql_affected_rows()>0){
				array_push($result, true);
			}
			else {
				array_push($result, false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	
	function getGrado($base){
		try {
			$link = conectar_db($base);
	        $result =array();
			$procedure = "SELECT id_grado,descripcion,n_cursos FROM `grados`";
			$query = mysql_query($procedure,$link);
			if(mysql_num_rows($query) >0){
				while($data = mysql_fetch_assoc($query)){
					array_push($result, array("id" => $data["id_grado"], "description" => $data["descripcion"], "n_cursos"=>$data["n_cursos"]));
				}
				mysql_close($link);
				return response($result);
			}else{
				$data_result = false;
				return $data_result;
			}
		} catch (Exception $th) {
			$data_result = $th->getMessage();
			return array('code'=>500,'response'=>$data_result);
		}
	}

	function getFiltros($base,$type) {
		try {
			$link = conectar_db($base);
	        $result =array();
			$procedure = "";
			switch ($type) {
				case 'Proceso':
					$procedure = "SELECT cod as id,proceso as description  FROM `mensajes_procesos`";
					break;
				case 'Satisfacción':
					$procedure = "SELECT cod_nivel as id, nivel_satisfacción as description FROM `mensajes_nivel_satifacción`";
					break;
				case 'Categoría':
					$procedure = "SELECT cod_tipo as id, tipo as description FROM `mensajes_tipo_justificacion` WHERE `cod_tipo` != 0";
					break;
				case 'Asunto':
					$procedure = "SELECT id_asunto as id, descripcion as description FROM `mensajes_asuntos` WHERE `estado` LIKE '1' ORDER BY `id_asunto` ASC";
					break;
				case 'Temas':
					$procedure = "SELECT id_tema as id, descripcion as description FROM `mensajes_temas` WHERE `Activo` = 1";
					break;
				case 'Estados':
					$procedure = "SELECT cod_state as id, state as description FROM `mensajes_estados` where `cod_state` not in (6,7,8)";
					break;
				case 'Tipo de mensaje':
					$procedure = "SELECT cod as id, descripcion as description FROM `mensajes_tipo_asunto`";
					break;
				default:
					return array('code' => 400, 'response' => 'Tipo de filtro no válido.');
					break;
			}
			$query = mysql_query($procedure,$link);
			if(mysql_num_rows($query) >0){
				while ($data = mysql_fetch_assoc($query)) {
					$result[] = $data;
				}
				mysql_close($link);
				return response($result);
			}else{
				$data_result = false;
				return $data_result;
			}
		} catch (Exception $th) {
			$data_result = $th->getMessage();
			return array('code'=>500,'response'=>$data_result);
		}
	}

	function updateSatistaction($base,$code){
		try {
			$link = conectar_db($base);
			$result =array();
			$proccess = "UPDATE `mensajes_registrados` SET `NIvel_satisfaccionII` = '1', `fecha_satistaccionII` = NOW() WHERE `mensajes_registrados`.`cod_mensaje` = $code";
			$query = mysql_query($proccess,$link);
			if(mysql_affected_rows()>0){
				array_push($result, true);
			}
			else {
				array_push($result, false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	
	function insertFilter($base,$filtros, $page, $limit) {
		$offset = ($page - 1) * $limit;
		try {
			$link = conectar_db($base);
			$result = [];
			if (is_string($filtros)) {
				$filtros = json_decode($filtros, true);
			}
			$mapaFiltros = [
				"Filter-Name" => "CONCAT(U.nombres, ' ', U.apellidos)",
				"Filter-Menssage" => "MR.mensaje",
				"Filter-Code" => "MR.id_estudiante",
				"Filter-Code-Menssage" => "MR.cod_mensaje",
				"Filter-Grade" => "G.id_grado",
				"Filter-Curse" => "C.id",
				"Filter-Reg-Initial" => "MR.fecha_registro",
				"Filter-Reg-Final" => "MR.fecha_registro",
				"Filter-Revision-Initial" => "MD.fecha_revisado",
				"Filter-Revision-Final" => "MD.fecha_revisado",
				"Filter-Answer-Initial" => "MD.fecha_respuesta",
				"Filter-Answer-Final" => "MD.fecha_respuesta",
				"Filter-Type-Destinatario" => "MD.destinatario",
				"Filter-Type-Mesagge" => "MR.tipo_mensaje",
				"Filter-Type-State" => "MR.estado_mensaje",
				"Filter-Type-Satistaction" => "MR.NIvel_satisfaccion",
				"Filter-Type-Topics" => "MT.id_tema",
				"Filter-Type-Process" => "MP.cod",
				"Filter-Type-Category" => "MR.tipo_justificado",
				"Filter-Type-Affair" => "MA.id_asunto"
			];

			// Define el tipo de comparación por cada filtro
			$tipoComparacion = [
				"Filter-Name" => "like",   
				"Filter-Menssage" => "like",     
				"Filter-Code" => "like", 
				"Filter-Code-Menssage" => "=",           
				"Filter-Grade" => "=",
				"Filter-Curse" => "=",
				"Filter-Reg-Initial" => "fecha",
				"Filter-Reg-Final" => "fecha",
				"Filter-Revision-Initial" => "fecha",
				"Filter-Revision-Final" => "fecha",
				"Filter-Answer-Initial" => "fecha",
				"Filter-Answer-Final" => "fecha",
				"Filter-Type-Destinatario" => "=",
				"Filter-Type-Mesagge" => "=",
				"Filter-Type-State" => "=",
				"Filter-Type-Satistaction" => "=",
				"Filter-Type-Topics" => "=",
				"Filter-Type-Process" => "=",
				"Filter-Type-Category" => "=",
				"Filter-Type-Affair" => "="
			];

			$condiciones = [];
			$fechasAgrupadas = [];
			foreach ($filtros as $filtro) {
    			$id = $filtro['id'];
				$valorOriginal = $filtro['value'];

				if (!isset($mapaFiltros[$id])) continue;

				$campo = $mapaFiltros[$id];
				$comparador = isset($tipoComparacion[$id]) ? $tipoComparacion[$id] : '=';

				// ───── Procesar valores que vengan como array, string o combinados con "/"
				// Si es string separado por comas lo volvemos array
				if (!is_array($valorOriginal)) {
					if (strpos($valorOriginal, ',') !== false) {
						$valorOriginal = explode(',', $valorOriginal);
					} else {
						$valorOriginal = [$valorOriginal];
					}
				}

				// Extraer la parte antes del "/", filtrar vacíos
				$valorLimpio = array_filter(array_map(function($v) {
					$partes = explode('/', $v);
					return trim($partes[0]);
				}, $valorOriginal));

				// ───── Comparador de fechas
				if ($comparador === 'fecha') {
					if (!isset($fechasAgrupadas[$campo])) {
						$fechasAgrupadas[$campo] = ['inicio' => null, 'fin' => null];
					}
					if (strpos($id, 'Initial') !== false) {
						$fechasAgrupadas[$campo]['inicio'] = mysql_real_escape_string($valorLimpio[0], $link);
					} elseif (strpos($id, 'Final') !== false) {
						$fechasAgrupadas[$campo]['fin'] = mysql_real_escape_string($valorLimpio[0], $link);
					}
					continue;
				}
				if ($comparador === 'like') {
					$valorSanitizado = mysql_real_escape_string(implode(' ', $valorLimpio), $link);
					$condiciones[] = "$campo LIKE '%$valorSanitizado%'";
				} else {
					if (count($valorLimpio) > 1) {
						$valoresSanitizados = array_map(function($v) use ($link) {
							return "'" . mysql_real_escape_string($v, $link) . "'";
						}, $valorLimpio);
						$condiciones[] = "$campo IN (" . implode(",", $valoresSanitizados) . ")";
					} else {
						$valorSanitizado = mysql_real_escape_string($valorLimpio[0], $link);
						$condiciones[] = "$campo = '$valorSanitizado'";
					}
				}
			}
			foreach ($fechasAgrupadas as $campo => $rango) {
				$inicio = $rango['inicio'] ? $rango['inicio'] . " 00:00:00" : null;
				$fin = $rango['fin'] ? $rango['fin'] . " 23:59:59" : null;

				if ($inicio && $fin) {
					$condiciones[] = "$campo BETWEEN '$inicio' AND '$fin'";
				} elseif ($inicio) {
					$condiciones[] = "$campo >= '$inicio'";
				} elseif ($fin) {
					$condiciones[] = "$campo <= '$fin'";
				}
			}

			if (isset($_SESSION["id"])) {
				$idUsuario = $_SESSION["id"];
				if ($idUsuario == '3018') {
					$condiciones[] = "U.id_grado <= 4";
				} elseif ($idUsuario == '120546') {
					$condiciones[] = "U.id_grado BETWEEN 4 AND 8";
				} elseif ($idUsuario == '31001' || $idUsuario == '120550') {
					$condiciones[] = "U.id_grado BETWEEN 9 AND 14";
				}
			}

			$whereClause = count($condiciones) > 0 ? implode(" AND ", $condiciones) : "1=1";
			$procedure = "SELECT IF(MR.tipo_asunto = 6, 'Queja', 'Mensaje') AS Tipo_Mensaje,
							MR.cod_mensaje,MR.proceso_redir AS cod_proceso_redir, MT.descripcion AS Tema,
							CONCAT(U.nombres, ' ', U.apellidos) AS Estudiante,U.id,
							CONCAT(G.abreviatura, '-', C.descripcion) AS Curso,U.id_grado as id_grado, U.curso, G.descripcion as grado,
							CONCAT(D.nombres, ' ', D.apellidos ) AS Destinatarios,
							DATE(MR.fecha_registro) AS fecha_registro,
							TIME(MR.fecha_registro) AS hora_registro, MSR.state,MP.proceso, MR.mensaje, MA.descripcion as asunto, MD.motivo,
							MS.state as estado_proceso,
							DATE(MD.fecha_revisado) AS fecha_revisado,
							TIME(MD.fecha_revisado) AS hora_revisado,
                            DATE(MD.fecha_respuesta) AS fecha_respuesta,
							TIME(MD.fecha_respuesta) AS hora_respuesta,
							MR.tipo_justificado,
                            J.tipo as justificadoTexto,
							MR.NIvel_satisfaccion AS cod_nivel_satifaccion, N.nivel_satisfacción as nivel_satisfaccion,
							MD.respuesta,MR.comentarios_padre,MR.comentarios_alumno,MR.plan_accion,MR.fecha_limite,MR.tiempo_gestion,
							MR.coment_satistaccion,MR.NIvel_satisfaccionII AS cod_nivel_satifaccionII,NII.nivel_satisfacción as nivel_satisfaccionII,MR.coment_satistaccionII,
							MR.comentarios_cordinador_calidad,MR.fecha_satistaccion,MR.fecha_satistaccionII, if(motQ.Motivo is null,0,motQ.Motivo) as motivo_queja 
							FROM mensajes_registrados AS MR 
							INNER JOIN mensajes_temas AS MT ON MR.Tema_mensaje = MT.id_tema 
							LEFT JOIN mensajes_destinatarios AS MD ON MD.cod_mensaje = MR.cod_mensaje 
							LEFT JOIN mensajes_estados AS MS ON MS.cod_state = MD.estado_dest
							INNER JOIN usuarios AS U ON U.id = MR.id_estudiante
							LEFT JOIN grados AS G ON U.id_grado = G.id_grado
							LEFT JOIN cursos AS C ON U.curso = C.id 
							LEFT JOIN usuarios AS D ON D.id = MD.destinatario
							INNER JOIN mensajes_estados AS MSR ON MSR.cod_state = MR.estado_mensaje 
							LEFT JOIN mensajes_procesos AS MP ON MP.cod = MT.proceso
							LEFT JOIN mensajes_asuntos AS MA ON MA.id_asunto = MT.id_asunto
							LEFT JOIN mensajes_tipo_justificacion as J ON J.cod_tipo = MR.tipo_justificado
							LEFT JOIN mensajes_nivel_satifacción AS N ON N.cod_nivel = MR.NIvel_satisfaccion
							LEFT JOIN mensajes_nivel_satifacción AS NII ON NII.cod_nivel = MR.NIvel_satisfaccionII
							LEFT JOIN mensaje_quejasmotivo AS motQ ON motQ.id_motivo = MR.motivo_queja
							WHERE $whereClause
							ORDER BY MR.fecha_registro DESC
							LIMIT 0, 40000";
			
			/* $procedure .= " LIMIT $limit OFFSET $offset"; */
							
			// Ejecutar consulta
			$query = mysql_query($procedure, $link);
			
			if (mysql_num_rows($query) == 0) {
				/* return response($result); */
				return $procedure;
			}
			while ($data = mysql_fetch_assoc($query)) {
				$tip_mensa = ($data["Tipo_Mensaje"]=="Mensaje")?1:2;
				array_push($result, array(
					"Cod_Tipo_Mensaje" => $tip_mensa,
					"Tipo_Mensaje" => $data["Tipo_Mensaje"],
					"cod_mensaje" => $data["cod_mensaje"],
					"Estudiante" => $data["Estudiante"],
					"cod_estudiante" => $data["id"],
					"id_grado" => $data["id_grado"],
					"grado" => $data["grado"],
					"Curso" => $data["Curso"],
					"fecha_registro" => $data["fecha_registro"],
					"Tema" => $data["Tema"],
					"cod_proceso_redir" => $data["cod_proceso_redir"],
					"hora_registro" => $data["hora_registro"],
					"estado" => $data["state"],
					"Destinatarios" => $data["Destinatarios"],
					"Proceso" => $data["proceso"],
					"mensaje" => $data["mensaje"],
					"asunto" => $data["asunto"],
					"motivo" => $data["motivo"],
					"respuesta" => $data["respuesta"],
					"motivo_queja" => $data["motivo_queja"],
					"comentarios_padre" => $data["comentarios_padre"],
					"comentarios_alumno" => $data["comentarios_alumno"],
					"plan_accion" => $data["plan_accion"],
					"fecha_limite" => $data["fecha_limite"],
					"tiempo_gestion" => $data["tiempo_gestion"],
					"estado_proceso" => $data["estado_proceso"],
					"fecha_revisado" => $data["fecha_revisado"],
					"hora_revisado" => $data["hora_revisado"],
					"fecha_respuesta" => $data["fecha_respuesta"],
					"hora_respuesta" => $data["hora_respuesta"],
					"tipo_justificado" => $data["tipo_justificado"],
					"justificadoTexto" => $data["justificadoTexto"],
					"cod_nivel_satifaccion" => $data["cod_nivel_satifaccion"],
					"nivel_satisfaccion" => $data["nivel_satisfaccion"],
					"coment_satistaccion" => $data["coment_satistaccion"],
					"cod_nivel_satifaccionII" => $data["cod_nivel_satifaccionII"],
					"nivel_satisfaccionII" => $data["nivel_satisfaccionII"],
					"coment_satistaccionII" => $data["coment_satistaccionII"],
					"comentCalidad" => $data["comentarios_cordinador_calidad"],
					"fecha_satistaccion" => $data["fecha_satistaccion"],
					"fecha_satistaccionII" => $data["fecha_satistaccionII"],
					
					"respuestaQuery" =>$procedure
				));
			}
			mysql_close($link);
			return response($result);
	
		} catch (Exception $e) {
			return json_encode(array('code' => 500, 'response' => $e->getMessage()));
		}
	}
	

	
	function saveCommentIng($base,$code,$coment){
		try {
			$link = conectar_db($base);
			$result =array();
			$id = $_SESSION["id"];
			$process = "UPDATE `mensajes_registrados` SET `comentarios_cordinador_calidad` = '$coment' WHERE `mensajes_registrados`.`cod_mensaje` = $code";
			
			$query = mysql_query($process,$link);
			if(mysql_affected_rows()>0){
				array_push($result, true);
			}
			else {
				array_push($result, false);
			}
			mysql_close($link);
			return response($result);
		}
		catch (Exception $e) {
			$error = $e->getMessage();
			return array('code'=>500,'response'=>$error);
		}	
	}

	
?>
