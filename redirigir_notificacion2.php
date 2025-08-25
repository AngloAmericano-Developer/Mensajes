<?php
$root = realpath($_SERVER["DOCUMENT_ROOT"]);
include("$root/funciones.php");
include("$root/includes/sesion.inc"); 

login();

$_SESSION['usuario'];
$id = $_POST['id'];
$linkd = conectar_db("caa".date("Y"));



$sql = "SELECT * FROM `mensajes_registrados` WHERE `vist_calid` = 0";

		
$consulta = mysql_query($sql);

if(mysql_num_rows($consulta) == 0){
	?>
	<div class="notificacion-burbuja inactivo">0</div>
	<?PHP
}else{
	?>
    <div class="notificacion-burbuja activo"><?PHP echo mysql_num_rows($consulta); ?></div>
    <?PHP	
}		
?>