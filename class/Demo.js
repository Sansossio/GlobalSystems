/*
	Sistema para uso exclusivo de TrackinGPS
	Desarrollado por Julio Sansossio
	Tecnologias aplicadas: JavaScript, NodeJS & TypeScript
	Venezuela 2016
*/
/* Enviar data robot */
var net = require('net');
var fs = require('fs');
var path = require("path");
var mov = [fs.readFileSync(path.join(__dirname,"..", "Robot", "mov1.txt"), 'utf8').split("\n"),fs.readFileSync(path.join(__dirname,"..", "Robot", "mov2.txt"), 'utf8').split("\n")];
var count = [0,0];
var config = JSON.parse(fs.readFileSync(path.join(__dirname,"..","config.json"), 'utf8'));
var client = new net.Socket();
var last = 0;
// Actualizar Configuracion
if(!config["RobotInterval"]){
	return;
}
client.connect(config["gps"][0]["Robot"], config["ip"], () => {
	setInterval(()=>{
		SendRobot(client,last);
		last = last == 0 ? 1 : 0;
	},(config["RobotInterval"] * 1000));
});
function SocketFormat(str,id){
	str = str.split(',');
	let re = id + "," + str[0] + "," + str[1] + "," + str[2] + "," + str[3] + ",tracker";
	return re;
}

function SendRobot(client, id){
	// Analizar data
	let imei = id == 0 ? 999 : 998;
	// Contadores
	count[id] = (count[id]+1) > (mov[id].length-1) ? 0 : count[id]+1;
	// Analizar y enviar
	let mo = mov[id][count[id]].replace(" ", "");
	// Enviar datos
	client.write(SocketFormat(mo, imei));
}

function testRobot(c,t){
	console.log(c);
}