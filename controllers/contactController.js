const express = require('express')
const mongoose = require('mongoose')
const Contact = mongoose.model('Contact')
const Company = mongoose.model('Customer')

const { downloadResource, getQuery } = require('../utils/utils')

const contactController = {}
/** Récupère une liste de contact selon un filtre
 *
 * @param {*} req
 * @param {*} res
 */
contactController.getAllContacts = (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)

	Contact.find(query)
		.populate({
			path: 'company',
			select: ['refNumber', 'name']
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort({ [orderby]: order })
		.then(contacts => {
			res.json({ success: true, data: contacts })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère une liste de contact selon un filtre et un idclient
 *
 * @param {*} req
 * @param {*} res
 */
contactController.getAllContactsFromCustomer = (req, res) => {
	const idCustomer = req.params.idCustomer

	let sterm = req.query.sterm || ''
	let sfield = req.query.sfield || ''
	let order = req.query.order || 'ASC'
	let orderby = parseInt(req.query.orderby) || 'name'
	let page = parseInt(req.query.page) || 1
	let limit = parseInt(req.query.limit) || 20
	let offset = 0 + (page - 1) * limit
	let query = {}

	//vérifie s'il y a des terms a rechercher
	if (sfield && sterm) {
		//vérifie s'il y a plus d'un terme à rechercher
		if (Array.isArray(sfield)) {
			sfield.forEach((field, index) => {
				if (Array.isArray(sterm)) {
					query[field] = { $regex: new RegExp(sterm[index], 'i') }
				} else {
					query[field] = { $regex: new RegExp(sterm, 'i') }
				}
			})
		} else {
			query = { [sfield]: { $regex: new RegExp(sterm, 'i') } }
		}
	}
	//recherche la liste des contacts
	if (!idCustomer) {
		return res
			.status(422)
			.json({ success: false, message: "Vous n'avez pas fourni tous les informations nécessaire à la requête." })
	}
	query.company = idCustomer

	Contact.find(query)
		.populate({
			path: 'company'
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort({ [orderby]: order })
		.then(contacts => {
			res.json({ success: true, data: contacts })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
contactController.getOneContact = (req, res) => {
	const idContact = req.params.idContact
	Contact.findOne({ _id: idContact })
		.select(['-__v', '-notes', '-surveys', '-contacts']) //champs à retirer
		.populate('user', '_id name')
		.then(savedContact => {
			if (!savedContact) {
				return res.status(404).json({ success: false, mesasge: "Cette page n'existe pas!" })
			}
			return res.json({ success: true, data: savedContact })
		})
		.catch(err => {
			if (!mongoose.isValidObjectId(idContact)) {
				return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
			}
			return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
		})
}

/** Création d'un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
contactController.createContact = (req, res) => {
	const idCustomer = req.params.idCustomer
	const { name, phone } = req.body

	if (!name || !phone.phone || !idCustomer) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	if (!mongoose.isValidObjectId(idCustomer)) {
		return res.status(422).json({ success: false, message: "Impossible d'ajouter un contact à ce client" })
	}
	const data = {
		...req.body,
		company: idCustomer,
		postedBy: req.user._id
	}

	const createContact = new Contact(data)

	try {
		createContact.save(function (err, savedData) {
			if (err) {
				return res.send(err)
			}
			//success
			return res.json({ success: true, _id: savedData._id, message: 'Le contact a été créé avec succès!' })
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
contactController.updateContact = (req, res) => {
	const { name, phone, email } = req.body
	const idContact = req.params.idContact
	if (!name || !phone.phone || !idContact) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		updatedBy: req.user._id
	}
	try {
		Contact.findOneAndUpdate({ _id: idContact }, { $set: data }, { new: true })
			.then(updatedData => {
				return res.json({
					success: true,
					message: `Le contact "${updatedData.name}" a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idContact)) {
					return res.status(404).json({ success: false, error: "Cette page n'existe pas!" })
				}
				return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
			})
	} catch (err) {
		return res.status(500).json({ success: false, errors: 'Un problème est survenu' })
	}
}

/**Suprime un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
contactController.deleteContact = (req, res) => {
	const idContact = req.params.idContact

	if (!idContact) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}

	Contact.findByIdAndDelete({ _id: idContact }, function (err) {
		if (err) {
			return res.status(403).json({ success: false, errors: err, message: 'Opération interdite' })
		}
		return res.json({
			success: true,
			message: `Le contact a été supprimé!`
		})
	})
}

contactController.exportContacts = async (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)
	const fields = [
		{
			label: 'Number',
			value: 'refNumber'
		},
		{
			label: 'Company number',
			value: 'company.refNumber'
		},
		{
			label: 'Company',
			value: 'company.name'
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
		}
	]
	let data = {}
	await Contact.find(query)
		.populate({
			path: 'company',
			select: ['refNumber', 'name']
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort({ [orderby]: order })
		.then(contacts => {
			data = contacts
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
contactController.importContacts = async (req, res) => {
	const { refNumber, company: companyName, phone, email } = req.body

	try {
		if (req.body.refNumber) {
			const resCompany = await Company.findOne({ refNumber: req.body.refNumber }).select(['-__v'])

			//vérifie si l'entreprise existe
			if (resCompany) {
				const data = {
					...req.body,
					company: resCompany._id
				}

				const resContact = await Contact.findOne({
					$and: [{ company: resCompany._id }, { name: req.body.name.trim() }]
				})

				//Edition
				if (resContact) {
					Contact.findOneAndUpdate({ _id: resContact._id }, { $set: data }, { new: true })
						.then(updatedData => {
							return res.json({
								success: true,
								action: 'updated',
								data: updatedData,
								message: `Le contact "${updatedData.name}" a été correctement sauvegardé`
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

					const createContact = new Contact(data)
					createContact.save(function (err, savedData) {
						if (err) {
							return res.send({ success: false, errors: err, message: 'Impossible de créé le contact' })
						}
						//success
						return res.json({
							success: true,
							action: 'created',
							data: savedData,
							message: 'Le contact a été créé avec succès!'
						})
					})
				}
			} else {
				return res.status(422).json({
					success: false,
					message: `Le client avec le numéro de Référence ${req.body.refNumber} n'existe pas, impossible d'ajouter le nouveau contact`
				})
			}
		} else {
			return res.status(422).json({ success: false, message: 'Numéro de référence invalide' })
		}
	} catch (err) {
		return res
			.status(500)
			.json({ success: false, errors: err, message: "Un problème est survenu lors de l'importation" })
	}
}

module.exports = {
	contactController
}
