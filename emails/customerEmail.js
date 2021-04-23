const { settingEmail, sendMail } = require('./config')
const striptags = require('striptags')

const customerEmail = {}

customerEmail.newCustomer = (to, data) => {
	msg = {
		from: settingEmail.from,
		to: to.map(item => item.email),
		subject: `[CRM] Nouveau Client`,
		html: `Bonjour, <br>
		Vous recevez ce courriel car un nouveau client a été ajouté dans le CRM. <br>
		Voici les informations de celui-ci. À tout moment vous pouvez modifier ces informations.

		<h3>Informations Entreprise</h3>
		<b>Nom</b> : ${data.name || ''} <br>
		<b>Courriel</b> : ${data.email || ''} <br>
		<b>Site web</b> : ${data.website || ''}<br>
		<b>Adresse</b>: <br>
		    <b>Rue</b>: ${data.address.address || ''}<br>
			<b>Ville</b>: ${data.address.city || ''}<br>
			<b>Province</b>: ${data.address.province || ''}<br>
			<b>Pays</b>: ${data.address.country || ''}<br>
			<b>Code Postal</b>: ${data.address.zip || ''}<br>
		<b>Téléphone</b>: ${data.phone.phone || ''} <b>Ext.</b>: ${data.phone.ext || ''}<br>
		<b>Cellulaire</b>: ${data.phone.cellulaire || ''}<br>

		<h3>Informations contact principal</h3>
		<b>Nom</b> : ${data.mainContact.name || ''} <br>
		<b>Courriel</b> : ${data.mainContact.email || ''} <br>
		<b>Poste</b> : ${data.mainContact.function || ''} <br>
		<b>Téléphone</b>: ${data.mainContact.phone.phone || ''} <b>Ext.</b>: ${data.mainContact.phone.ext || ''}<br>
		<b>Cellulaire</b>: ${data.mainContact.phone.cellulaire || ''}<br>

		${settingEmail.signature}`
	}

	msg.text = striptags(msg.html)
	sendMail(msg)
}

customerEmail.archiveCustomer = (to, data) => {
	msg = {
		from: settingEmail.from,
		to: to.map(item => item.email),
		subject: `[CRM] Client archivé`,
		html: `Bonjour, <br>
		Vous recevez ce courriel car ce client "<b>${updatedData.name}</b>" a été archivé dans le CRM. <br>
		Vous pouvez consulter ce client en affichant dans la liste des clients les filtres supplémentaire et cochez la case archive.
		${settingEmail.signature}`
	}

	msg.text = striptags(msg.html)
	sendMail(msg)
}

customerEmail.deleteCustomer = (to, data) => {
	msg = {
		from: settingEmail.from,
		to: to.map(item => item.email),
		subject: `[CRM] Suppression d'un client`,
		html: `Bonjour, <br>
		Vous recevez ce courriel car ce client a été <b>complètement supprimer</b> dans le CRM. <br>

		<h3>Informations Entreprise</h3>
		<b>Nom</b> : ${data.name || ''} <br>
		<b>Courriel</b> : ${data.email || ''} <br>
		<b>Site web</b> : ${data.website || ''}<br>
		<b>Adresse</b>: <br>
		    <b>Rue</b>: ${data.address.address || ''}<br>
			<b>Ville</b>: ${data.address.city || ''}<br>
			<b>Province</b>: ${data.address.province || ''}<br>
			<b>Pays</b>: ${data.address.country || ''}<br>
			<b>Code Postal</b>: ${data.address.zip || ''}<br>
		<b>Téléphone</b>: ${data.phone.phone || ''} <b>Ext.</b>: ${data.phone.ext || ''}<br>
		<b>Cellulaire</b>: ${data.phone.cellulaire || ''}<br>

		<h3>Informations contact principal</h3>
		<b>Nom</b> : ${data.mainContact.name || ''} <br>
		<b>Courriel</b> : ${data.mainContact.email || ''} <br>
		<b>Poste</b> : ${data.mainContact.function || ''} <br>
		<b>Téléphone</b>: ${data.mainContact.phone.phone || ''} <b>Ext.</b>: ${data.mainContact.phone.ext || ''}<br>
		<b>Cellulaire</b>: ${data.mainContact.phone.cellulaire || ''}<br>
		${settingEmail.signature}`
	}
	msg.text = striptags(msg.html)
	sendMail(msg)
}

module.exports = {
	customerEmail
}
