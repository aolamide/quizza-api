import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config()

sgMail.setApiKey(process.env.SG_KEY);

const sendVerifyMail = (email, token, name) => {
  const link = `https://quizza.live/verify?token=${token}&email=${email}`;
  const mailOptions = {
      from: `Quizza <noreply@quizza.live>`,
      to: email,
      reply_to : 'help@quizza.live',
      template_id : 'd-19b5c36e04e6463f9f11a634e2afb719',
      dynamic_template_data : {
        link,
        name
      }
  };
  return sgMail.send(mailOptions);
}


export default sendVerifyMail;