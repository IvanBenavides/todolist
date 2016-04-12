$(document).ready(function() {

	var db=openDatabase('todo','1.0','mi base de datos', 2*1024*1024);
	db.transaction(function (tx) {
		seleccionar(tx);
	});

	$("#tarea").keypress(function (event) {
		if (event.keyCode === 13) {
			db.transaction(function (tx) {
				insertar(tx);
			});
		}
	});

	// db.transaction(function (tx) {
	// 	crear(tx);
	// 	insertar(tx);
	// 			// actualizar(tx);
	// 			seleccionar(tx);
	// 		});

	// Crear tabla
	var crear = function crear(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS tab(id, nombre, estado)');	
		alert("BD Tareas inicializada");
	};

	// Insertar en la tabla
	var insertar = function insertar(tx){
		var $tarea = $("#tarea");
		// console.log($tarea.val());
		tx.executeSql('INSERT INTO tab (id, nombre,estado) VALUES ("'+guid()+'", "'+$tarea.val()+'","true")');
		$tarea.val("");
		seleccionar(tx);
	};
	// Eliminar una tarea 
	
	var contenidoTabla = function contenidoTabla(data, tx) {
		var r = "";
		if(data.estado=="true"){
			r += "<tr><td><input type='checkbox' id='che_"+(data.id)+"' /></td><td>"+data.nombre+"</td>" + 
			"<td><img src='img/eliminar.png' id='del_"+(data.id)+"'/></td></tr>";
		}else{
			r += "<td><input type='checkbox' id='che_"+(data.id)+"' checked/></td>" +
			"<td><div class='terminado'>"+data.nombre+"</div></td>" + 
			"<td><img src='img/eliminar.png' id='del_"+(data.id)+"'/></td>";
		}
		return r;
	};

	/****************************************************************************************************
	*    Profe no se como sacar el id cuando le den al checkbox ni cuando le den click a la imagen      *
	*                                    Gracias por su colaboracion                                    *
	*****************************************************************************************************

	$("#che_"+).click(function (event) {
		var ind = this.split("_");
		console.log(ind);
	});
	$("#del_"+).click(function (event) {
		var ind = this.split("_");
		console.log(ind);
	});
	*/


	// Seleccionar todos los registros
	var seleccionar =  function seleccionar(tx){
		tx.executeSql('SELECT * FROM tab',[],function(tx,results)
		{
			task = [];
			var len=results.rows.length;
			$("#titulo").html("TO-DO ("+(len <= 9 ? "0" + len : len)+")");
			var tar = "<table border='1'>"+
			"<tr>" +
			"<td>Estado</td>" + 
			"<td>Nombre</td>" + 
			"<td>Eliminar</td>"+
			"</tr><tr>";
			if(len != 0){
				for (i=0;i<len;i++)
				{
					task[i] = results.rows[i];
					tar += contenidoTabla(task[i], tx);					
				}
			}
			tar += "</tr></table>";
			$("#imprime").html(tar);

		});
		

	};
	
	//Eliminar un registro
	var eliminar = function(tx, id) {
		// console.log(id);
		tx.executeSql('DELETE FROM tab WHERE id="'+id+'" ');
		seleccionar(tx);
	}

	// actualizar un registro de la tabla
	var actualizar = function actualizar(tx){
		tx.executeSql('UPDATE tab SET estado="true"');
			// tx.executeSql('INSERT INTO tab (nombre,apellido) VALUES ("'+nom+'","'+ape+'")');
		};

		// Generador de IDs
		var guid = function guid() {
			function _p8(s) {
				var p = (Math.random().toString(16) + "000000000").substr(2, 8);
				return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
			}
			return _p8() + _p8(true) + _p8(true) + _p8();
		};
	});