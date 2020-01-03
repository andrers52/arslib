// EmailService.js
// const nodemailer = require('nodemailer')
// const mailgunTransport = require('nodemailer-mailgun-transport')

// Configure transport options
const mailgunOptions = {
  auth: {
    api_key: 'your api key goes here',
    domain: 'your domain goes here',
  }
}



// EmailService
class EmailService {
  constructor(nodemailer, mailgunTransport) {

    const transport = mailgunTransport(mailgunOptions)    
    this.emailClient = nodemailer.createTransport(transport)
  }

  sendText(to, subject, text) {
    return new Promise((resolve, reject) => {
      this.emailClient.sendMail({
        from: '"Your name" <Your e-mail>',
        to,
        subject,
        text,
      }, (err, info) => {
        if (err) {
          reject(err)
        } else {
          resolve(info)
        }
      })
    })
  }
}

//export default emailService
module.exports = EmailService
