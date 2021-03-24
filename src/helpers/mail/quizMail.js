import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config()

sgMail.setApiKey(process.env.SG_KEY);

const sendQuizMail = (quizId, quizName, userEmail, userName, questions, answers) => {
    let QA = questions.map((question, i) => {
        let display = `<div class='${(i + 1) % 2 ? '' : 'oddQ'}'><div><strong>QUESTION ${i + 1} </strong></div><br><div><em>${question.title}</em></div><div><strong>A.</strong> ${question.options[0]}</div><div><strong>B.</strong> ${question.options[1]}</div><div><strong>C.</strong> ${question.options[2]}</div><div><strong>D.</strong> ${question.options[3]}</div><br><div>Correct Answer : <strong>${answers[i]}<strong></div><br><br></div>`;
        return display;
    });
    QA = QA.join('');
    const mailOptions = {
        from: `Quizza <noreply@quizza.live>`,
        to: userEmail,
        reply_to : 'help@quizza.live',
        template_id : 'd-6cd3b5c2841a4b919df7fddefb9a660b',
        dynamic_template_data : {
            QA,
            userName,
            quizName,
            quizId
        }
    };
    return sgMail.send(mailOptions);
}


export default sendQuizMail;