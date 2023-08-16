const nodemailer = require("nodemailer");

const from = "nourimailer@gmail.com";

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: from,
    pass: "yiihvtevkevtxfei",
  },
});

exports.sendEmail = (email, fullname, subject, message) => {
  
  let mailOptions = {
    from: '"Ali Nouri" ' + from, // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    html: `<h1> Hi ${fullname}</h1>
    <p>${message} </p>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};