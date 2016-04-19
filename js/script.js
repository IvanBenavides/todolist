$(document).ready(function() {

	// Crear BD
	var db=openDatabase('todo','1.0','mi base de datos', 2*1024*1024);
	db.transaction(function (tx) {
		crear(tx);
		seleccionar(tx);
	});

	// Evento al dar enter
	$("#tarea").keypress(function (event) {
		if (event.keyCode === 13) {
			db.transaction(function (tx) {
				insertar(tx);
			});
		}
	});

	// Crear tabla
	var crear = function crear(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS tareas(id, nombre, estado, fecha)');	
		// swal("BD Creada!", "La BD TODO ha inicializado.", "success");
	};

	// Insertar en la tabla
	var insertar = function insertar(tx){
		if ($("#tarea").val().length !== 0) {
			var $tarea = $("#tarea");
			tx.executeSql('INSERT INTO tareas (id, nombre, estado, fecha) VALUES ("'+guid()+'", "'+$tarea.val()+'", 1, "'+ Date()+'")');
			$tarea.val("");
			seleccionar(tx);
		}else{
			swal("Error!", "Digite la tarea!", "error");
		}
	}; 
	
	// Crear fila por cada tarea
	var contenidoTabla = function contenidoTabla(data) {
		var r = "";
		var colorTarea = "color: " + randomColor();
		if(data.estado === 1){
			r += "<tr><td><input type='checkbox' id='che_"+(data.id)+"' class='checkdiv "+data.estado+"' /></td>" + 
			"<td style='"+colorTarea+"' class='upd'><div contenteditable='true' id='upd_"+(data.id)+"' >"+data.nombre+"</div></td>" + 
			"<td><img src='img/eliminar.png' id='del_"+(data.id)+"' class='checkdel'/></td></tr>";
		}else{
			r += "<tr><td><input type='checkbox' id='che_"+(data.id)+"' checked class='checkdiv "+data.estado+"' /></td>" +
			"<td contenteditable='true'><div class='terminado'>"+data.nombre+"</div></td>" + 
			"<td><img src='img/eliminar.png' id='del_"+(data.id)+"' class='checkdel'/></td></tr>";
		}
		return r;
	};

	// Seleccionar todos los registros
	var seleccionar =  function seleccionar(tx){
		var tar = "";
		tx.executeSql('SELECT * FROM tareas ORDER BY fecha DESC',[],function(tx,results)
		{
			var task = [];
			var len=results.rows.length;
			$("#titulo").html("To Do List ("+(len <= 9 ? "0" + len : len)+")");
			if(len > 0){
				tar = "<div align='center' id='tabint'><table id='tableTodo'>"+
				"<tr>" +
				"<th>Estado</th>" + 
				"<th>Nombre</th>" + 
				"<th>Eliminar</th>"+
				"</tr><tr>";
				for (var i=0;i<len;i++)
				{
					task[i] = results.rows[i];
					tar += contenidoTabla(task[i]);				
				}
				$("#tableTodo").prepend(contenidoTabla(len));
			}
			tar += "</tr></table></div>";
			$("#imprime").html(tar);

			for (i=0;i<$(".checkdiv").size();i++){
				var dato1 = $(".checkdiv")[i].id;
				$("#" + dato1).click(function(e){
					var token = this.id.split("_")[1];
					db.transaction(function(t){
						t.executeSql("SELECT estado FROM tareas WHERE id='"+token+"'", [], function(t, result){
							var data = [];
							for (var i = 0, n = result.rows.length; i < n; i++){
								data[i] = result.rows[i].estado;
							}
							actualizar(t, data[0], token);
						});
					});
				});
			}
			for (i=0;i<$(".checkdel").size();i++){
				var del = $(".checkdel")[i].id;
				$("#" + del).click(function(e){
					var delid = this.id.split("_")[1];
					eliminar(delid);
				});
			}			
		});
	};

	//Eliminar un registro
	var eliminar = function(id){
		swal({   
			title: "¿Estás segur@?",   
			text: "¿Deseas eliminar esta tarea?",   
			type: "warning",   
			showCancelButton: true,   
			confirmButtonColor: "#088A08",   
			confirmButtonText: "Si!",   
			cancelButtonText: "No!",   
			closeOnConfirm: false,   
			closeOnCancel: false 
		}, 
		function(isConfirm){   
			if(isConfirm){     
				db.transaction(function(t){
					var ejecutaSQL = "DELETE FROM tareas WHERE id=? ";
					t.executeSql(ejecutaSQL, [id]);  
					seleccionar(t);
				});
				swal("Eliminada!", "La tarea se ha eliminado.", "success");   
			}else{
				swal("Cancelado", "La tarea está a salvo :)", "error");   
			} 
		});
	}

	// actualizar un registro de la tabla
	var actualizar = function (t, state, id){
		var ejecutaSQL = "UPDATE tareas SET estado=? WHERE id=?";
		if(state === 1){
			t.executeSql(ejecutaSQL, [0, id]);
			seleccionar(t);
		}
		if(state === 0){
			t.executeSql(ejecutaSQL, [1, id]);
			seleccionar(t);
		}
	};
	var actulizarTarea = function (nombre, id) {
		db.transaction(function(t){
			var ejecutaSQL = "UPDATE tareas SET nombre=? WHERE id=?";
			t.executeSql(ejecutaSQL, [nombre, id]);  
			seleccionar(t);
		});
	}

	// Crear color de forma aleatoria
	var randomColor = function(){
        // from http://www.paulirish.com/2009/random-hex-color-code-snippets/
        return '#'+(function lol(m,s,c){return s[m.floor(m.random() * s.length)] +
        	(c && lol(m,s,c-1));})(Math,'0123456789ABCDEF',4);
        };

		// Generador de IDs
		var guid = function guid(){
			function _p8(s) {
				var p = (Math.random().toString(16) + "000000000").substr(2, 8);
				return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
			}
			return _p8() + _p8(true) + _p8(true) + _p8();
		};
	});