// import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config()

sgMail.setApiKey(process.env.SG_KEY);


const sendMail = (userEmail, token) => {
    const mailOptions = {
        from: `Quizza Reset Password <noreply@quizza.live>`,
        to: userEmail,
        subject: 'Quizza Password Reset',
        reply_to : 'help@quizza.live',
        template_id : 'd-b599fec316584a6f802585d77076738e',
        dynamic_template_data : {
            link : `https://quizza.live/reset/${token}`
        }
    };
    return sgMail.send(mailOptions);
}

export default sendMail;