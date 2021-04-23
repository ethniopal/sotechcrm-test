const express = require('express')
const mongoose = require('mongoose')
const Customer = mongoose.model('Customer')
const { downloadResource, getQuery } = require('../utils/utils')
const { permission, status: statusUser } = require('../constants/user')
const { customerEmail } = require('../emails/customerEmail')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission
const customerController = {}
// const { omit } = require('../utils/utils')

/** Récupère une liste de client selon un filtre
 *
 * @param {*} req
 * @param {*} res
 */
customerController.getAllCustomers = async (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)

	let ejectedCompanyId = []
	//vérifie les clients sans activités
	if (req.query.noActivity === 'true') {
		const Activity = mongoose.model('Activity')
		await Activity.distinct('company').then(companies => {
			ejectedCompanyId = [...companies]
		})
	}

	if (req.query.noContact === 'true') {
		const Contact = mongoose.model('Contact')
		await Contact.distinct('company').then(companies => {
			ejectedCompanyId = [...ejectedCompanyId, ...companies]
		})
	}

	if (req.query.noSubmission === 'true') {
		const Submission = mongoose.model('Submission')
		await Submission.distinct('company').then(companies => {
			ejectedCompanyId = [...ejectedCompanyId, ...companies]
		})
	}

	query._id = { $nin: ejectedCompanyId }

	Customer.find(query)
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v', '-notes', '-surveys', '-contacts']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort([[orderby, order]])
		.then(customers => {
			res.json({ success: true, count: customers.length, data: customers })
		})
		.catch(err => console.log(err))
}

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
customerController.getOneCustomer = (req, res) => {
	const idCustomer = req.params.idCustomer
	Customer.findOne({ _id: idCustomer })
		.select(['-__v', '-notes', '-surveys', '-contacts']) //champs à retirer
		.populate('user', '_id name')
		.then(data => {
			if (!data) {
				return res.status(404).json({
					success: false,
					message: "Cette page n'existe pas! "
				})
			}
			return res.json({ success: true, data: data })
		})
		.catch(err => {
			if (!mongoose.isValidObjectId(idCustomer)) {
				return res.status(404).json({
					success: false,
					message: "Cette page n'existe pas! "
				})
			}
			return res.status(500).json({
				success: false,
				errors: err,
				message: "Une erreur s'est produite"
			})
		})
}

/** Création d'un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
customerController.createCustomer = (req, res) => {
	const { name, phone, status } = req.body

	if (!name || !status || !phone.phone) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		postedBy: req.user._id
	}

	const createCustomer = new Customer(data)

	try {
		createCustomer.save(function (err, savedData) {
			if (err) {
				return res.send({ success: false, errors: err, message: 'Un problème est survenu' })
			}
			const User = mongoose.model('User')
			User.find({ permission: { $in: [ADMIN, COLLABORATOR] }, status: statusUser.ACTIVE })
				.select(['email'])
				.then(users => {
					customerEmail.newCustomer(users, savedData)
				})

			//success
			return res.json({
				success: true,
				data: {
					_id: savedData._id
				},
				message: 'Le client a été créé avec succès!'
			})
		})
	} catch (err) {
		return res.json({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

/** Mise à jour d'un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
customerController.updateCustomer = (req, res) => {
	const { name, phone, status } = req.body
	const idCustomer = req.params.idCustomer
	if (!name || !status || !phone.phone || !idCustomer) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		updatedBy: req.user._id
	}
	try {
		Customer.findOneAndUpdate({ _id: idCustomer }, { $set: data }, { new: true })
			.then(updatedData => {
				return res.json({
					success: true,
					message: `Le client ${updatedData.name} a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idCustomer)) {
					return res.status(404).json({ success: false, error: err, message: "Cette page n'existe pas!" })
				}
				return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
			})
	} catch (err) {
		return res.status(500).json({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

/** Modifie le status
 *
 * @param {*} req
 * @param {*} res
 */
customerController.archiveCustomer = (req, res) => {
	const { archive } = req.body
	const idCustomer = req.params.idCustomer

	if (!idCustomer || archive == undefined) {
		return res.status(422).json({
			success: false,
			message: `Une erreur s'est produite, le server n'a pas eu suffisament d'information pour enregistrer votre requête.`
		})
	}

	const data = {
		archive: archive,
		updatedBy: req.user._id
	}
	try {
		Customer.findOneAndUpdate({ _id: idCustomer }, { $set: data }, { new: true })
			.then(updatedData => {
				//récupère la liste des utilisateurs pour l'envoie de courriel
				const User = mongoose.model('User')
				User.find({ permission: { $in: [ADMIN, COLLABORATOR] }, status: statusUser.ACTIVE })
					.select(['email'])
					.then(users => {
						customerEmail.archiveCustomer(users, updatedData)
					})
				return res.json({
					success: true,
					message: `L'utilisateur "${updatedData.name}" a été correctement archivé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idCustomer)) {
					return res.status(404).json({ success: false, error: err, message: "Cette page n'existe pas!" })
				}
				return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
			})
	} catch (err) {
		return res.status(500).json({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

/**Suprime un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
customerController.deleteCustomer = (req, res) => {
	const idCustomer = req.params.idCustomer

	if (!idCustomer) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}

	Customer.findByIdAndDelete({ _id: idCustomer }, async (err, docs) => {
		if (err) {
			return res.status(403).json({ success: false, errors: err, message: 'Opération interdite' })
		}

		const Contact = mongoose.model('Contact')
		const Activity = mongoose.model('Activity')
		const Attachement = mongoose.model('Attachment')
		const resDeleteContact = await Contact.deleteMany({ company: idCustomer })
		const resDeleteActivity = await Activity.deleteMany({ company: idCustomer })
		const resDeleteAttachement = await Attachement.deleteMany({ company: idCustomer })

		//récupère la liste des utilisateurs pour l'envoie de courriel
		const User = mongoose.model('User')
		await User.find({ permission: { $in: [ADMIN, COLLABORATOR] }, status: statusUser.ACTIVE })
			.select(['email'])
			.then(users => {
				customerEmail.deleteCustomer(users, docs)
			})

		return res.json({
			success: true,
			message: `Le client a été supprimé. Ce qui a entrainé la suppression de ${resDeleteContact.deletedCount} 
					contact(s), ${resDeleteActivity.deletedCount} activité(s), ${resDeleteAttachement.deletedCount} soumissions,
					${resDeleteAttachement.deletedCount} Notes,  ${resDeleteAttachement.deletedCount} pièces jointes!`
		})
	})
}

customerController.exportCustomer = async (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)
	const fields = [
		{
			label: 'Number',
			value: 'refNumber'
		},
		{
			label: 'Name',
			value: 'name'
		},
		{
			label: 'Adress 1',
			value: 'address.address'
		},
		{
			label: 'City',
			value: 'address.city'
		},
		{
			label: 'Area',
			value: 'address.province'
		},
		{
			label: 'Zip Code',
			value: 'address.zip'
		},
		{
			label: 'Country',
			value: 'address.country'
		},

		{
			label: 'Phone',
			value: 'phone.phone'
		},

		{
			label: 'Phone Ext',
			value: 'phone.ext'
		},
		{
			label: 'Fax',
			value: 'phone.fax'
		},
		{
			label: 'Cell Phone',
			value: 'phone.mobile'
		},
		{
			label: 'Email',
			value: 'email'
		},
		{
			label: 'Language',
			value: 'language'
		},
		{
			label: 'Date of Creation',
			value: 'createdAt'
		},

		{
			label: 'Contact',
			value: 'mainContact.name'
		},
		{
			label: 'Contact Title',
			value: 'mainContact.function'
		},
		{
			label: 'Contact Phone',
			value: 'mainContact.phone.phone'
		},
		{
			label: 'Contact Extension',
			value: 'mainContact.phone.ext'
		},
		{
			label: 'Contact Fax',
			value: 'mainContact.phone.fax'
		},
		{
			label: 'Contact Email',
			value: 'mainContact.email'
		}
	]
	let data = {}
	await Customer.find(query)
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v', '-notes', '-surveys', '-contacts']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort([[orderby, order]])
		.then(customers => {
			data = customers
		})
	if (data) {
		return downloadResource(res, 'customers.csv', fields, data)
	}
	return res.json({
		success: false,
		message: `Un erreur s'est produit lors de l'exportation des donneés!`
	})
}

/** Mise à jour d'un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
customerController.importCustomer = async (req, res) => {
	const { refNumber, name, phone, email } = req.body

	if (!name || !phone || !email) {
		return res.json({ success: false, message: 'Ne contenait pas tous les champs prérequis' })
	}
	try {
		if (req.body.refNumber) {
			const resCompany = await Customer.findOne({ refNumber: req.body.refNumber }).select(['-__v'])

			//vérifie si l'entreprise existe
			if (resCompany) {
				const data = {
					...req.body,
					company: resCompany._id
				}

				Customer.findOneAndUpdate({ _id: resCompany._id }, { $set: data }, { new: true })
					.then(updatedData => {
						return res.json({
							success: true,
							action: 'updated',
							data: updatedData,
							message: `Le client "${updatedData.name}" a été correctement sauvegardé`
						})
					})
					.catch(err => {
						return res.status(500).json({
							success: false,
							errors: err,
							message: "Une erreur s'est produite"
						})
					})
			} else {
				//Ajout du contact

				const createCustomer = new Customer(data)
				createCustomer.save(function (err, savedData) {
					if (err) {
						return res.send({ success: false, errors: err, message: 'Impossible de créé le client' })
					}
					//success
					return res.json({
						success: true,
						action: 'created',
						data: savedData,
						message: 'Le client a été créé avec succès!'
					})
				})
			}
		} else {
			return res.status(422).json({ success: false, message: 'Numéro de référence invalide ou manquant' })
		}
	} catch (err) {
		return res
			.status(500)
			.json({ success: false, errors: err, message: "Un problème est survenu lors de l'importation" })
	}
}

module.exports = {
	customerController
}
