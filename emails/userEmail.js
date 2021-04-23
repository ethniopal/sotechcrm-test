const { settingEmail, sendMail } = require('./config')
const striptags = require('striptags')

const userEmail = {}

userEmail.changePasswordEmail = (to, data) => {
	msg = {
		from: settingEmail.from,
		to,
		subject: `[CRM] Le mot de passe de votre compte a été modifié`,
		html: `Bonjour ${data.name}, <br>
		le mot de passe de votre compte sur le CRM SotechNitram a été modifié. <br>
		Si vous n'êtes pas à l'origine de cette modification, veuillez en informé un administrateur.
		${settingEmail.signature}
		`
	}

	msg.text = striptags(msg.html)
	sendMail(msg)
}

userEmail.changeStatusUserEmail = (to, data) => {
	msg = {
		from: settingEmail.from,
		to,
		subject: `[CRM] Le status de votre compte a été modifié`,
		html: `Bonjour ${data.name}, <br>
		votre compte sur le CRM SotechNitram est désormais <b>${data.status}</b>. <br>
		Le statut a été modifier par un des administrateurs.
		${settingEmail.signature}
		`
	}

	msg.text = striptags(msg.html)

	sendMail(msg)
}

userEmail.newUser = (to, data) => {
	msg = {
		from: settingEmail.from,
		to,
		subject: `[CRM] Bienvenue`,
		html: `Bonjour ${data.name}, <br>
		votre compte sur le CRM SotechNitram a été créé. <br>
		Voici les informations de celui-ci. À tout moment vous pouvez modifier ces informations via votre profile utilisateur.

		<b>Nom</b> : ${data.name || ''} <br>
		<b>Courriel</b> : ${data.email || ''} <br>
		<b>Mot de passe</b> : ${data.password || ''} <br>
		<b>Status</b>: ${data.status || ''} <br>
		<b>Rôle utilisateur</b> : ${data.permission || ''} <br>
		<b>Adresse</b>: <br>
		    <b>Rue</b>: ${data.address.address || ''}<br>
			<b>Ville</b>: ${data.address.city || ''}<br>
			<b>Province</b>: ${data.address.province || ''}<br>
			<b>Pays</b>: ${data.address.country || ''}<br>
			<b>Code Postal</b>: ${data.address.zip || ''}<br>
		<b>Téléphone</b>: ${data.phone.phone || ''} <b>Ext.</b>: ${data.phone.ext || ''}<br>
		<b>Cellulaire</b>: ${data.phone.cellulaire || ''}<br>

		${settingEmail.signature}`
	}

	msg.text = striptags(msg.html)
	sendMail(msg)
}

module.exports = {
	userEmail
}
