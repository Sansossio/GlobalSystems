/*
	Sistema para uso exclusivo de TrackinGPS
	Desarrollado por Julio Sansossio
	Tecnologias aplicadas: JavaScript, NodeJS & TypeScript
	Venezuela 2016
*/
const fs = require('fs');
const path = require("path");
const nodemailer = require('nodemailer');
const config = JSON.parse(fs.readFileSync(path.join(__dirname,"..","config.json"), 'utf8'));
const transporter = nodemailer.createTransport('smtps://notifications.trackinggps%40gmail.com:Trackinggps*@smtp.gmail.com');
const eTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'email.html')).toString();
var net = require('net');
var server = net.createServer((socket) =>{
	try{
		Send(socket);
	}catch(err){
		console.log(colors.red(err));
	}
}).listen(1337, config['ip'], ()=>{
	console.log("-> Servidor email iniciado");
});
var Send = (socket) => {
	socket.on("data", receive=>{
		let analize = receive.toString().split('|');
		let email = analize[0];
		let suject = "Sin asunto;"
    	var html = eTemplate;
    	for(var j = 0; j < 5; j++){
			for(var i = 1; i < analize.length; i++){
				let tm = analize[i].split(':');
				html = html.replace("%" + tm[0] + "%", tm[1]);
				suject = tm[0] == "suject" ? tm[1] : suject;
			}	
    	}
		var mailOptions = {
		    from: '"Alerta Tracker" <notifications.trackinggps@gmail.com>',
		    to: email, 
		    subject: suject,
		    html: html
		};
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error);
		    }else{
		    	console.log("-> Email enviado");
		    }
		});
	});
	socket.on("error",(socket)=>{
		socket.destroy();
	})
		
}
