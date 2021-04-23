const sgMail = require('@sendgrid/mail')
const { SENDGRID_KEY } = require('../keys')
sgMail.setApiKey(SENDGRID_KEY)

const settingEmail = {
	from: process.env.FROM_EMAIL,
	signature: `Voici le lien de l'application : ${process.env.APP_URL} 
	<br><br>Ce courriel est un envoie automatisé, veuillez ne pas y répondre.`
}

function sendMail(msg) {
	sgMail
		.send(msg)
		.then(response => {
			console.log('Email sent : ' + msg.subject)
		})
		.catch(error => {
			console.error(error)

			if (error.response) {
				// Extract error msg
				const { message, code, response } = error

				// Extract response msg
				const { headers, body } = response

				console.error(body)
			}
		})
}

module.exports = {
	settingEmail,
	sendMail
}
