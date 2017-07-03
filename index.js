/*
	Sistema para uso exclusivo de TrackinGPS
	Desarrollado por Julio Sansossio
	Tecnologias aplicadas: JavaScript, NodeJS & TypeScript
	Venezuela 2016
*/
console.log("-> Iniciando sistema");
const argv = require('minimist')(process.argv.slice(2));
const colors = require('colors/safe')
const net = require('net');
const fs = require('fs');
const path = require("path");
const config = JSON.parse(fs.readFileSync(path.join(__dirname,"config.json"), 'utf8'));
const gps = config.gps;
var mysql = require('mysql');
const dateFormat = require('dateformat');
const express = require('express');  
const app = express(), server = require('http').Server(app), c = require('child_process'), io = require('socket.io')(server), cak = "forever restart /globalsystem/index.js", Analize = new (require(path.join(__dirname,'class','Analize')))();
const ws = require("ws");
var clients = [], count = [0,0,0,0,0];
const commands = new (require(path.join(__dirname,"class","Commands")));
const validator = require("email-validator");
const eTemplate = fs.readFileSync(path.join(__dirname, 'html', 'email.html')).toString();
const whtml = fs.readFileSync(path.join(__dirname, 'html', 'index.html')).toString();
var run = true;
if(fs.existsSync(path.join(__dirname,"up.sas"))){
	var array = fs.readFileSync(path.join(__dirname,"up.sas")).toString().split("\n");
	for(i in array) {
    	//count[0] = Number(array[i]) > 0 ? Number(array[i]) : count[0];
	}
	//fs.unlink(path.join(__dirname,"up.sas"));
}
// Arrancar servidores
var servers = [];
for(var i = 0; i < gps.length; i++){
	var object = gps[i];
	for (property in object) {
        var value = object[property];
        if(value > -1){
			let tm = net.createServer(
				(socket) => {
					try{
						Sock(socket);
					}catch(err){
						console.log(colors.red(err));
					}	
				}).listen(value,config.ip);
			servers.push(tm);
			console.log(colors.blue("-> GPS Iniciado : " + property + " (" + config.ip + ":" + value + ")"));  	
        }
    }
}
function StopServices(){
	run = false;
	server.close();
	for(var i = 0; i < servers.length; i++){
		servers[i].close();
	}
}
// Time actual
function Now(timezone = 0){
	let calc = (timezone * 1000 * 60 * 60);
	return Date.now() + calc;
}
// Conexion MySql
var work = false;
var db;
var db_config = {
  	host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.table
};
var cds = 0;
function Connection(){
	if(cds != 0)
		db.end();
	cds++;
	db = mysql.createConnection(db_config);
    db.connect((err)=>{
		if(!err){
			console.log(colors.blue("-> Conexion mysql correcta"));
			work = true;
			return;
		}
		Err( err);
		work = false;
		setTimeout(Connection,5000);
	});
	db.on('error',(err) =>{
		if(err){
			Err("-> Mysql: " + err);
			setTimeout(Connection, 5000);
		}
	});
}
Connection();

// Buscar
function Search(val){
	var re = -1;
	for(var i = 0; i < clients.length; i++){
		if(clients[i]['nd'].getId() == val || clients[i]['socket'] == val)
			re = i;
	}
	return re;
}
function Delete(socket){
	var d = Search(socket);
	if(d > -1){
		clients[d]['socket'].destroy();
		clients.splice(d,1);
		Err("Gps Desconectado");
	}
}
function getTime(){
	return Math.round(Date.now()/1000)
}
// Eliminar gps de la lista
setInterval(()=>{
	let current;
	if(!work)
		return;
	for(var i = 0; i < clients.length; i++){
		current = getTime() - Number(clients[i]['lastdata']);
		if(current > 600)
			Delete(clients[i]['socket']);
	}
},60000);
// Funcion core
var Sock = (socket) =>{
	// Buscar modelo del gps por el puerto
	var model = "";
	for(var i = 0; i < gps.length; i++){
		var object = gps[i];
		for (property in object) {
			var value = object[property];
	        if(value == socket.localPort){
	        	model = property;
	        }
	    }
	}
	// Recibir datos
	socket.on("data", receive => {
		let noF = "NaNUndefined";
		Analize.Read(receive.toString(), model);
		// Escribir en el gps
		socket.write(new Buffer("LOAD"));
        socket.write(new Buffer("ON"));
		if(work && Analize.Status()){
			// Verificar archivo
			fs.exists(path.join(__dirname,'class',  Analize.getModel() + ".js"),function(exists){
				if(exists && Analize.getModel() != 'test'){
					// Insertar cliente en la lista
					let tmp = new (require(path.join(__dirname,'class', Analize.getModel())))(receive.toString());
					// Si es correcto ingresar
					if(tmp.getId().length < 2 || !tmp.Status()){
						return;
					}
					let bs = Search(socket) == -1 ? Search(tmp.getId()) : Search(socket);
					if (bs == -1){
						let em = dateLog("Gps Conectado (" + Analize.getModel() + ") ID: " + tmp.getId());
						sendSocket(formatSocket(em), "green");
						console.log(colors.green(em));
						clients.push({'alti' : 0, 'lat' : 0, 'long' : 0, 'socket' : socket, 'model' : Analize.getModel(), 'data' : 0, 'nd' : tmp, 'mail' : 'tracker', 'time' : getTime(), 'lastdata' : getTime()});
					}else{
						clients[bs]['nd'] = tmp;
					}
					if(Search(socket) == -1){
						return;
					}
					bs = Search(socket);
					if(typeof clients[bs]['nd'] != "undefined" && clients[bs]['nd'].Status() && noF.indexOf(clients[bs]['nd'].getSpeed()) == -1 && noF.indexOf(clients[bs]['nd'].getCourse()) == -1 && noF.indexOf(clients[bs]['nd'].getCoords()[0]) == -1 && noF.indexOf(clients[bs]['nd'].getCoords()[1]) == -1 && noF.indexOf(clients[bs]['nd'].getCoords()[2]) == -1 && noF.indexOf(clients[bs]['nd'].getSpeed()) == -1){
						var date;
						/*console.log(colors.green("-> GPS: " + Analize.getModel() + " envio datos correctamente"));
						sendSocket(formatSocket("-> GPS: " + Analize.getModel() + " envio datos correctamente"), "green");
						*/
		        		var sql = "SELECT e.timezone FROM placas AS p,sk_empresas AS e WHERE p.idtracker = " + clients[bs]['nd'].getId() + " AND e.idempresa = p.id_sk_empresa LIMIT 1";
						db.query(sql, (err,rows) =>{
							count[1] += 1;
							let timezone = 0;
								if(err){
									Error(err);
								}else{
								if(rows.length > 0){
									timezone = rows[0].timezone;
								}
								if(clients[bs]['nd'] == "undefined")
									return;
								for(var i = 0; i < clients[bs]['nd'].getCoords().length-1; i++){
									if(clients[bs]['nd'].getCoords()[i] == 0){
										return;
									}
								}
								// Guardar datos
								date = dateFormat(Now(timezone), "yyyy-mm-dd H:MM:ss");
								let hour = date.split(" ")[1], status = clients[bs]['nd'].getSignal() ? 1 : 0,
								tm = "";
								for(var i = 0; i < hour.split(':').length; i++){
									tm += hour.split(':')[i].length == 1 ? 0 + "" + hour.split(':')[i] : hour.split(':')[i];
									tm += ":";
								}
								tm = tm.substring(0, tm.length-1);
								hour = tm;
								date = date.split(" ")[0] + " " + hour;
								dm1 = dateFormat(Now(timezone), "dd/mm/yyyy"),
								dm2 = date.split(" ")[0];
								let cnt = true;
								let cosd = clients[bs]['nd'].getCoords();
								clients[bs]['lastdata'] = getTime();
								clients[bs]['alti'] = clients[bs]['nd'].getCoords()[2];
								clients[bs]['lat'] = clients[bs]['nd'].getCoords()[0];
								clients[bs]['long'] = clients[bs]['nd'].getCoords()[1];
								clients[bs]['long'] *= Analize.getModel() == "Robot" ? 1 : -1;
								clients[bs]['long'] *= clients[bs]['long'] < 0 ? -1 : 1;
								for(var h = 0; h < cosd.length-1; h++){
									if(typeof cosd[h] == "undefined" || cosd[h] == 0){
										cnt = false;
										return;
									}
								}
								if(!cnt)
									return;
								try{
									var velocidad = clients[bs]['nd'].getSpeed();
									if (velocidad<200) {
										db.query("INSERT INTO `data` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm1 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										//db.query("INSERT INTO `panel` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm1 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										db.query("INSERT INTO `data_v2` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm2 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										//db.query("INSERT INTO `panel_v2` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm2 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										count[1] += 5;
									}
								}catch(err){
									Err(err);
									return;
								}

							var velocidad = clients[bs]['nd'].getSpeed();
							if (velocidad<200) {
								db.query("SELECT * FROM panelunicovalidado as p, panelunicovalidado_v2 as p2 WHERE p.idtracker = '" + clients[bs]['nd'].getId() + "' AND p2.idtracker = p.idtracker", (err,rows) =>{
									if(err){
										Err( err);
										return;
									}
									try{
										clients[bs]['long'] *= clients[bs]['long'] < 0 ?  -1 : 1;
										if(rows.length != 1){
										db.query("DELETE FROM panelunicovalidado WHERE idtracker = '" + clients[bs]['nd'].getId() + "'",(err) =>{if(err){Err( err)}});
										//db.query("DELETE FROM panelunicovalidado_v2 WHERE idtracker = '" + clients[bs]['nd'].getId() + "'",(err) =>{if(err){Err( err)}});
										db.query("INSERT INTO `panelunicovalidado` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm1 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										//db.query("INSERT INTO `panelunicovalidado_v2` VALUES (null,'NULL'," + clients[bs]['alti'] + "," + clients[bs]['nd'].getCourse() + "," + clients[bs]['lat'] + "," + clients[bs]['long'] + ",'" + clients[bs]['nd'].getOther() + "',''," + clients[bs]['nd'].getSpeed() + ",'" + hour + "','0','" + clients[bs]['nd'].getId() + "','" + dm2 + "', '0','" + status + "','0','" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "','" + clients[bs]['nd'].getFuel() + "','" + clients[bs]['nd'].getDoor() + "')",(err) =>{if(err){Err( err)}});
										count[1] += 4;
										}else{
											db.query("UPDATE panelunicovalidado as p, panelunicovalidado_v2 as p2 SET p.altitude = " + clients[bs]['alti'] + ",p2.altitude = " + clients[bs]['alti'] + ", p.orientation = " + clients[bs]['nd'].getCourse() +", p2.orientation = " + clients[bs]['nd'].getCourse() +", p.latx = " + clients[bs]['lat'] + ", p2.latx = " + clients[bs]['lat'] + ", p.longt = " + clients[bs]['long'] + ", p2.longt = " + clients[bs]['long'] + ", p.other = '" + clients[bs]['nd'].getOther() + "', p2.other = '" + clients[bs]['nd'].getOther() + "', p.speed = '" + clients[bs]['nd'].getSpeed() + "', p2.speed = '" + clients[bs]['nd'].getSpeed() + "', p.time = '" + hour + "', p2.time = '" + hour + "', p.date = '" + dm1 + "', p2.date = '" + dm2 + "', p.status = '" + status + "', p2.status = '" + status + "', p.signal = '" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "', p2.signal = '" + (clients[bs]['nd'].getSignal() ? 1 : 0) + "', p.fuel = '" + clients[bs]['nd'].getFuel() + "', p2.fuel = '" + clients[bs]['nd'].getFuel() + "', p.door = '" + clients[bs]['nd'].getDoor() + "', p2.door = '" + clients[bs]['nd'].getDoor() + "' WHERE p.idtracker = '" + clients[bs]['nd'].getId() + "' AND p2.idtracker = '" + clients[bs]['nd'].getId() + "'", (err) =>{if(err)Err( err);});
											count[1] += 1;
										}
									}catch(err){
										Err(err);
										return;
									}
									
								});
							}
								// Enviar correo
								if(clients[bs]['nd'].getOther() != "tracker"){
									count[1] += 1;
									db.query("SELECT * FROM mail WHERE imei = '" + clients[bs]['nd'].getId() + "'", (error,mailrow) => {
										if(error){
											Err( error);
											return;
										}
										if(mailrow.length == 0)
											return;
										if(typeof mailrow[0][clients[bs]['nd'].getOther()] != 'undefined' && mailrow[0][clients[bs]['nd'].getOther()] == 1){
											
											db.query("SELECT p.placa, e.Nombreempresa as name, u.email as email, e.imagen as logo, e.telefono as contact FROM placas as p, sk_empresas as e, usuarios as u WHERE p.idtracker = " + clients[bs]['nd'].getId() + " AND e.idempresa = p.id_sk_empresa AND u.idempresa = p.idempresa", (err,rows)=>{
												count[1] += 1;
												if(err){
													Err( err);
													return;
												}
												if(rows.length == 0) return;
												let confi = config["email"][clients[bs]['nd'].getOther()];
												if(!confi){
													Err("Datos email para '" + clients[bs]['nd'].getOther() + "' no encontrados");
													return;
												}
												// Validar email
												validator.validate_async(rows[0].email, (err,isValid) => {
													if(err){
														Err( err);
														return;
													}
													if(!isValid){
														Err("Email invalido : " + rows[0].email);
														return;
													}
													// Intervalo minimo
													if(clients[bs]['mail'] != clients[bs]['nd'].getOther() || Number(getTime() - clients[bs]['time']) > Number(config["EmailInterval"] * 60)){
														let sendSockets = rows[0].email;
														// Configurar parametros
														confi["placa"] = rows[0].placa;
														confi["date"] = date;
														confi["logo"] = "http://149.56.106.166/trac/logoempresas/" + rows[0].logo;
														confi["name"] = rows[0].name;
														confi["lat"] = clients[bs]['nd'].getCoords()[0];
														confi["Long"] = clients[bs]['long'];
														confi["contact"] = rows[0].contact;
														// Enviar
														let Email = new (require(path.join(__dirname,"class","Email")))(eTemplate);
														Email.send(rows[0].email,confi);
														let em = dateLog("Correo enviado: " + rows[0].email + ", alerta: " + clients[bs]['nd'].getOther() + ", placa: " + confi["placa"]);
														Email = null;
														sendSocket(formatSocket(em), "green");
														console.log(colors.green(em));
														clients[bs]['mail'] = clients[bs]['nd'].getOther();
														clients[bs]['time'] = getTime();
														count[2] += 1;
													}
												});
												
											});
										}
									});		
								}
								// Enviar a webServer
								if(Analize.getModel() != "Robot"){
									//let sox = formatSocket(Analize.getModel(),clients[bs]['nd'].getId(),clients[bs]['nd'].getOther(),clients[bs]['nd'].getSignal(),clients[bs]['nd'].getSpeed(),clients[bs]['nd'].getCourse(),clients[bs]['lat'],clients[bs]['long'],clients[bs]['alti'], clients[bs]['nd'].getFuel(),clients[bs]['nd'].getDoor(),date);
									//sendSocket(sox,"gps");
								}
							}	
						});
						++clients[bs].data;						
					}
				}else{
					if(Analize.getModel() == "test"){
						// Enviar datos
						let send = "String: <br>" + receive.toString() + "<br>Hex:<br> " + receive.toString("hex");
						
						db.query("INSERT INTO test_gps VALUES (null, '" + send + "')",(err) =>{if(err){Err( err)}});
						count[1] += 1;
						sendSocket(send,"test");
					}else{
						Err("Clase no encontrada : " + Analize.getModel());
					}
				}
			});
			return;	
		}
	});
	// Error
	socket.on("error", (receive) =>{
		Delete(socket);
	});
}
// Comandos
setInterval(()=>{
	count[1] += 1;
	db.query("SELECT cmd_id,imei,command FROM command WHERE status = '1'", (err,rows) =>{
		if(err){
			Err( err);
			return;	
		}
		for(var i = 0; i < rows.length; i++){
			let id = rows[i].imei, command = rows[i].command;
			let bs = Search(id);
			if(bs == -1){
				Err("Comando: GPS offline = " + id);
				return;
			}
			// Verificar existencia del comando
			try{
				config.commands[clients[bs].model][0][command];
			}catch(err){
				db.query("DELETE FROM command WHERE cmd_id = '" + rows[i]['cmd_id'] + "'", (err)=>{
					if(err)
						Err( err);
				});
				Err(clients[bs].model == "Robot" ? "No se puede enviar comando a un robot " : err);
				return;
			}

			commands.Data(config.commands[clients[bs].model][0][command],clients[bs]['nd'].getId());
			if(!commands.Status()){
				Err("Comando no encontrado: " + command + " (" + clients[bs].model + ")");
			}else{
				clients[bs].socket.write(new Buffer(commands.getCommand()));
				sendSocket(formatSocket("Comando enviado: " + command + " (" + clients[bs].model + " : " + id + ")"), "green");
				count[1] += 1;
			}
		}
	});
			db.query("UPDATE command SET status = '0' WHERE 1", (err)=>{if(err){Err( err)}});	
},5000);
// Robot demo
setTimeout(()=>{
	if(run){
		require(path.join(__dirname,"class","Demo"));
	}
	
},config["RobotInterval"]*1000);
// WebServer
function webServer(){
	// Cerrar anterio
	server.close();
	// Iniciar nuevamente
/*	app = express();
	server = require('http').Server(app);
	io = require('socket.io')(server);*/
	server.listen(583, () => {  
    	console.log(colors.blue("-> WebServer iniciado (" + config.ip + ":583)"));
	});
	server.on("error",(err)=>{
		Err("WebServer:" + err);
	});
	app.get("/", (req,res)=>{
		res.status(200);
		res.send(whtml);
		res.end();
	});
	app.on("error",(err)=>{
		Err("WebServer:" + err);
	});
	io.on('connection', (socket) => {  
	    socket.on('devices', function(s) {  
	    	Analize.t(s,c,socket);
		});
	});
}
webServer();
function formatSocket(){
	var re = "";
	for (var i = 0; i < arguments.length; i++) {
		re += "[" + arguments[i] + "]";
	}
	return re;
}
function sendSocket(sock,name){
	io.sockets.emit(name,sock);
}
function dateLog(log){
	return ("-> (" + dateFormat(Now(-4), "yyyy-mm-dd H:MM:ss") + ") " + log);
}
function Err(err){
	if(err.toString().indexOf('ER_DUP_ENTRY') == -1 && err.toString().indexOf('ER_PARSE_ERROR') == -1 && err.toString().indexOf('NaN') == -1 && err.toString().indexOf('undefined') == -1){
		let re = formatSocket(dateLog(err));
		sendSocket(re,"error");
		console.log(colors.red(dateLog(err)));
		// Escribir archivo
		//writeFile(er,path.join(__dirname,"logs",dateFormat(Now(-4), "dd-mm-yyyy(H)") + ".txt"));
		if(err.toString().indexOf('Query after fatal error') > -1){
			Connection();
		}
	}
}
setInterval(() => {
	if(!work)
		return;
	count[4]++;
	// Reiniciar servidor
	if(count[4] >= 5400){
		writeFile((count[0]+1),path.join(__dirname, "up.sas"));
		setTimeout(()=>{
			
			//Analize.t(cac,c,false);
			Analize.t(cak,c,false);
			count[4] = 0;
			//process.exit();
		},2000); 
		
		//webServer();
		//count[4] = 0;
		return;
	}/**/
	count[3] = clients.length > count[3] ? clients.length : count[3];
	sendSocket(formatSocket(clients.length, ++count[0], count[1], count[2],count[3]), "online");
	let devices = "";
	for(var i = 0; i < clients.length; i++){
		devices += formatSocket(clients[i]['nd'].getId() + "," + clients[i].model + "," + clients[i].data);
	}
	if(devices != ""){
		sendSocket(devices, "devices");
	}	
},1000);
// Guardar logs
function writeFile(data,file){
	var content;
	try{
		content = fs.readFileSync(file).toString() + "\n" + data;
	}catch(e){
		content = data;
	}
    fs.writeFile(file, content, function (err,data) {
	  if(err){
	  		console.log(err);
	  		return;
	  	}
	});
	
}