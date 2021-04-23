const express = require('express')
const mongoose = require('mongoose')
const Activity = mongoose.model('Activity')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission
const activityController = {}

/** Récupère une liste de activity selon un filtre
 *
 * @param {*} req
 * @param {*} res
 */
activityController.getAllActivities = (req, res) => {
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

	Activity.find(query)
		.populate({
			path: 'company',
			select: ['name']
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort({ [orderby]: order })
		.then(activities => {
			res.json({ success: true, data: activities, message: '' })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère une liste de activity selon un filtre et un idclient
 *
 * @param {*} req
 * @param {*} res
 */
activityController.getAllActivitiesFromCustomer = (req, res) => {
	const idCustomer = req.params.idCustomer
	//recherche la liste des activities
	if (!idCustomer) {
		return res
			.status(422)
			.json({ success: false, message: "Vous n'avez pas fourni tous les informations nécessaire à la requête." })
	}

	let sterm = req.query.sterm || ''
	let sfield = req.query.sfield || ''
	let order = req.query.order || 'DESC'
	let orderby = parseInt(req.query.orderby) || 'date'
	let page = parseInt(req.query.page) || 1
	let limit = parseInt(req.query.limit) || 9999
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

	//récupère la compagnie visé
	query.company = idCustomer

	const dateNow = new Date()

	if (req.query.time === 'past') {
		query.date = { $lte: dateNow }
		order = 'DESC'
		orderby = 'date'
	}

	if (req.query.time === 'incoming') {
		query.date = { $gte: dateNow }
		order = 'ASC'
		orderby = 'date'
	}

	const usersQuery = req.query.users
	if (usersQuery) {
		query.postedBy = { $in: usersQuery.split(',') }
	}

	Activity.find(query)
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
		.then(activities => {
			res.json({ success: true, count: activities.length, data: activities, message: '' })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
activityController.getOneActivity = (req, res) => {
	const idActivity = req.params.idActivity
	Activity.findOne({ _id: idActivity })
		.select(['-__v', '-notes', '-surveys', '-activities']) //champs à retirer
		.populate('user', '_id name')
		.then(savedActivity => {
			if (!savedActivity) {
				return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
			}
			return res.json({ success: true, data: savedActivity, message: '' })
		})
		.catch(err => {
			if (!mongoose.isValidObjectId(idActivity)) {
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
activityController.createActivity = (req, res) => {
	const idCustomer = req.params.idCustomer
	const { date, interactionType, typeResponse, descriptionResponse } = req.body

	console.log(req.body)
	if (!date || !interactionType || !typeResponse || !descriptionResponse) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	if (!mongoose.isValidObjectId(idCustomer)) {
		return res.status(422).json({
			success: false,
			message: "Impossible d'ajouter une activité à ce client, le client n'est pas valide."
		})
	}
	const data = {
		...req.body,
		company: idCustomer,
		postedBy: req.user._id
	}

	const createActivity = new Activity(data)

	try {
		createActivity.save(function (err, savedData) {
			if (err) {
				return res.send({
					success: false,
					errors: err,
					message: "Un erreur s'est produite, veuillez réessayer."
				})
			}
			//success
			return res.json({ success: true, _id: savedData._id, message: "L'activité a été créée avec succès!" })
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
activityController.updateActivity = (req, res) => {
	const { date, interactionType, typeResponse, descriptionResponse } = req.body
	const idActivity = req.params.idActivity
	if (!date || !interactionType || !typeResponse || !descriptionResponse || !idActivity) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		updatedBy: req.user._id
	}
	try {
		Activity.findOneAndUpdate({ _id: idActivity }, { $set: data }, { new: true })
			.then(updatedData => {
				return res.json({
					success: true,
					message: `L'activité "${updatedData.name}" a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idActivity)) {
					return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
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
activityController.deleteActivity = (req, res) => {
	const idActivity = req.params.idActivity

	if (!idActivity) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}

	Activity.findByIdAndDelete({ _id: idActivity }, function (err) {
		if (err) {
			return res.status(403).json({ success: false, errors: err, message: 'Opération interdite' })
		}

		return res.json({
			success: true,
			message: `L'activité a été supprimé!`
		})
	})
}

module.exports = {
	activityController
}
