const express = require('express')
const mongoose = require('mongoose')
const Note = mongoose.model('Note')
const { getQuery } = require('../utils/utils')

const noteController = {}
/** Récupère une liste de note selon un filtre
 *
 * @param {*} req
 * @param {*} res
 */
noteController.getAllNotes = (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)

	Note.find(query)
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
		.sort('-createdAt')
		.then(notes => {
			res.json({ success: true, data: notes })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère une liste de note selon un filtre et un idclient
 *
 * @param {*} req
 * @param {*} res
 */
noteController.getAllNotesFromCustomer = (req, res) => {
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
	//recherche la liste des notes
	if (!idCustomer) {
		return res
			.status(422)
			.json({ success: false, message: "Vous n'avez pas fourni tous les informations nécessaire à la requête." })
	}
	query.company = idCustomer

	Note.find(query)
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
		.sort('-createdAt')
		.then(notes => {
			res.json({ success: true, data: notes })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
noteController.getOneNote = (req, res) => {
	const idNote = req.params.idNote
	Note.findOne({ _id: idNote })
		.select(['-__v']) //champs à retirer
		.populate('user', '_id name')
		.then(savedNote => {
			if (!savedNote) {
				return res.status(404).json({ success: false, mesasge: "Cette page n'existe pas!" })
			}
			return res.json({ success: true, data: savedNote })
		})
		.catch(err => {
			if (!mongoose.isValidObjectId(idNote)) {
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
noteController.create = (req, res) => {
	const idCustomer = req.params.idCustomer
	const { title, description } = req.body

	if (!title || !description || !idCustomer) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	if (!mongoose.isValidObjectId(idCustomer)) {
		return res.status(422).json({ success: false, message: "Impossible d'ajouter un note à ce client" })
	}
	const data = {
		...req.body,
		company: idCustomer,
		postedBy: req.user._id
	}

	const createNote = new Note(data)

	try {
		createNote.save(function (err, savedData) {
			if (err) {
				return res.send(err)
			}

			//success
			return res.json({
				success: true,
				data: {
					_id: savedData._id,
					postedBy: { _id: req.user._id, name: req.user.name },
					title: savedData.title,
					description: savedData.description,
					createdAt: savedData.createdAt
				},
				message: 'La note a été créé avec succès!'
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
noteController.update = (req, res) => {
	const { title, description } = req.body
	const idNote = req.params.idNote
	if (!title || !description || !idNote) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		updatedBy: req.user._id
	}
	try {
		Note.findOneAndUpdate({ _id: idNote }, { $set: data }, { new: true })
			.then(updatedData => {
				return res.json({
					success: true,
					message: `Le note "${updatedData.title}" a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idNote)) {
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
noteController.delete = (req, res) => {
	const idNote = req.params.idNote

	if (!idNote) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}

	Note.findByIdAndDelete({ _id: idNote }, function (err) {
		if (err) {
			return res.status(403).json({ success: false, errors: err, message: 'Opération interdite' })
		}
		return res.json({
			success: true,
			message: `Le note a été supprimé!`
		})
	})
}

module.exports = {
	noteController
}
