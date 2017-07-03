"use strict";
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport('smtps://notifications.trackinggps%40gmail.com:Trackinggps*@smtp.gmail.com');
var Email = (function () {
    function Email(template) {
        this.template = template;
    };
    Email.prototype.send = function (email,config) {
    	let suject = "Sin asunto;"
    	var html = this.template;
    	for(var i = 0; i < 5; i++){
    		Object.keys(config).forEach(function(key){
			    var value = config[key];
			    html = html.replace("%" + key + "%", value);
			    suject = key == "suject" ? value : suject;
			});
    	}
		var mailOptions = {
		    from: '"Alerta Tracker" <notifications.trackinggps@gmail.com>',
		    to: email, 
		    subject: suject,
		    html: html
		};
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error)
		    }
		});
	

    };
    return Email;
}());
module.exports = Email;
