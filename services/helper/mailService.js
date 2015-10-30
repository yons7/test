var nodemailer = require('nodemailer');

var _mailservice = {
   
    sendMail : function (user) {
        // create reusable transporter object using SMTP transport
        var transporter = nodemailer.createTransport(config.mail.transport.param);

        // NB! No need to recreate the transporter object. You can use
        // the same transporter object for all e-mails
        
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.mail.transport.param.auth.user, // sender address
            to: user.email, // list of receivers
            subject: config.mail.subject, // Subject line
            text: config.mail.text + user.password // plaintext body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });

    },

};

module.exports = _mailservice;