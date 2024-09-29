import nodemailer from 'nodemailer';

const EmailSend = async (EmailTo, EmailSubject, EmailText) => {
  let transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  let mailOption = {
    from: 'Abdus Samad <abdusbdcalling@gmail.com>',
    to: EmailTo,
    subject: EmailSubject,
    text: EmailText,
  };
  return await transport.sendMail(mailOption);
};

export default EmailSend;
