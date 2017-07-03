"use strict";
var nodemailer = require('nodemailer');
var Email = (function(){
	function Email(email,user){

	};
	Email.prototype.Send = function(){
		// create reusable transporter object using the default SMTP transport 
		var transporter = nodemailer.createTransport('smtps://notifications.trackinggps%40gmail.com:Trackinggps*@smtp.gmail.com');
		 
		// setup e-mail data with unicode symbols 
		var mailOptions = {
		    from: '"TrackinGPs" <notifications.trackinggps@gmail.com>', // sender address 
		    to: 'juliosansossio@gmail.com', // list of receivers 
		    subject: 'Hello ✔', // Subject line 
		    text: 'Hello world 🐴', // plaintext body 
		    html: '<b>Hello world 🐴</b>' // html body 
		};
		 
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return false;
		    }
		    return true;
		});
	};
	
	return Email;
});
module.exports = Email;