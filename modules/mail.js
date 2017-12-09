const nodemailer = require('nodemailer');

let mailTransporter = nodemailer.createTransport({
    service: 'mail',
    host: 'smtp.mail.ru',
    port: 465,
    auth: {
        user: "zayavki-s-saita26@mail.ru", 
        pass: "Alex132456"
    },
    secure: true
});

module.exports = mailTransporter