const nodemailer = require('nodemailer')
const mailgunTransport = require('nodemailer-mailgun-transport')

const EmailService = require('./email-service')

var emailService = new EmailService(nodemailer, mailgunTransport)
emailService.sendText('test@gmail.com', 'E-mails working!', 'Working!!!! YAY!!!')
  .then(() => {
    console.log('Email sent successfully')
  })
  .catch(() => {
    console.log('Error sending email')
  })
