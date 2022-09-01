const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path')

const send = function ({
    title = process.env.EMAIL_TITLE,
    from = process.env.EMAIL_FROM,
    to = '',
    htmlPath = '',
    replacements = {},
}) {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // tls: {
        //     rejectUnauthorized: false
        // },
    });

    const filePath = path.join(__dirname, `../email/${htmlPath}`);
    // const filePath = htmlPath;

    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const handlebarsTemplate = handlebars.compile(source);

    const handleBarsReplacements = replacements;
    const htmlToSend = handlebarsTemplate(handleBarsReplacements);

    transporter.sendMail({
        from: from,
        to: to,
        subject: title,
        html: htmlToSend,
    }, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent to: ${to} title: ${title} id: ${info.messageId}`);
        }
    });

}

/* Sample
sendMail({
    title: 'New password',
    from: '"usashop.mn" <support@usashop.mn>',
    to: "ankhbayar1014@gmail.com",
    htmlPath: 'password-reset.html',
    replacements: {
        newpassword: "12sad1"
    }
})
*/


module.exports = {
    sendMail: send
};

