const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const { getQuery } = require('../utils/utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const { userEmail } = require('../emails/userEmail')

const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission
const userController = {}

// const { omit } = require('../utils/utils')

/** Récupère une liste de client selon un filtre
 *
 * @param {*} req
 * @param {*} res
 */
userController.getAll = async (req, res) => {
	const [query, limit, order, orderby, offset] = getQuery(req)

	User.find(query)
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.populate({
			path: 'updatedBy',
			select: ['name']
		})
		.select(['-__v', '-password']) //champs à retirer
		.limit(limit)
		.skip(offset)
		.sort([[orderby, order]])
		.then(users => {
			res.json({ success: true, data: users })
		})
		.catch(err => console.log(err))
}

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
userController.getOne = (req, res) => {
	const idUser = req.params.idUser
	User.findOne({ _id: idUser })
		.select(['-__v', '-password']) //champs à retirer
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
			if (!mongoose.isValidObjectId(idUser)) {
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

/** Récupère un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
userController.getProfile = (req, res) => {
	const idUser = req.user._id
	User.findOne({ _id: idUser })
		.select(['-__v', '-password']) //champs à retirer
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
			if (!mongoose.isValidObjectId(idUser)) {
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
userController.create = (req, res) => {
	const { name, email, password, status, permission } = req.body

	if (!email || !password || !status || !name || !permission) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		postedBy: req.user._id
	}

	User.findOne({ email: email })
		.then(savedUser => {
			if (savedUser) {
				return res.status(422).json({
					success: false,
					message: 'Cet utilisateur existe déjà! Veuillez utiliser un autre utilisateur'
				})
			}

			bcrypt.hash(password, 12).then(hashedPassword => {
				const user = new User({
					...req.body,
					name,
					email,
					password: hashedPassword,
					postedBy: req.user._id
				})
				user.save()
					.then(savedData => {
						//envoie du courriel
						userEmail.newUser(savedData.email, {
							name: savedData.name,
							email: savedData.email,
							password: password,
							status: savedData.status,
							permission: savedData.permission,
							address: {
								address: savedData.address,
								city: savedData.city,
								province: savedData.province,
								country: savedData.country,
								zip: savedData.zip
							},
							phone: {
								phone: savedData.phone,
								ext: savedData.ext,
								mobile: savedData.mobile
							}
						})

						res.json({
							success: true,
							data: {
								_id: savedData._id
							},
							message: 'Utilisateur enregistrer'
						})
					})
					.catch(err => console.log(err))
			})
		})
		.catch(err => console.log(err))
}

/** Mise à jour d'un client selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
userController.update = (req, res) => {
	let { name, email, status, permission } = req.body
	let idUser = req.user._id

	//exception utilisateur
	if (req.user.permission === ADMIN) {
		idUser = req.params.idUser
	} else {
		permission = req.user.permission
		status = req.user.status
	}

	if (!email || !status || !idUser || !name || !permission) {
		return res.status(422).json({ success: false, message: 'Merci de compléter tous les champs obligatoire.' })
	}

	const data = {
		...req.body,
		updatedBy: req.user._id
	}
	try {
		User.findOneAndUpdate({ _id: idUser }, { $set: data }, { new: true })
			.then(updatedData => {
				return res.json({
					success: true,
					message: `L'utilisateur ${updatedData.name} a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idUser)) {
					return res.status(404).json({ success: false, error: err, message: "Cette page n'existe pas!" })
				}
				return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
			})
	} catch (err) {
		return res.status(500).json({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

/**Modifie le status de l'utilisateur
 *
 * @param {*} req
 * @param {*} res
 */
userController.changeStatus = (req, res) => {
	const { status } = req.body
	const idUser = req.params.idUser
	if (!idUser || !status) {
		return res.status(422).json({
			success: false,
			message: `Une erreur s'est produite, le server n'a pas eu suffisament d'information pour enregistrer votre requête.`
		})
	}

	const data = {
		status: status,
		updatedBy: req.user._id
	}
	try {
		User.findOneAndUpdate({ _id: idUser }, { $set: data }, { new: true })
			.then(async updatedData => {
				//Envoie courriel
				await userEmail.changeStatusUserEmail(updatedData.email, {
					name: updatedData.name,
					status: updatedData.status
				})
				return res.json({
					success: true,
					message: `L'utilisateur "${updatedData.name}" a été correctement sauvegardé`
				})
			})
			.catch(err => {
				if (!mongoose.isValidObjectId(idUser)) {
					return res.status(404).json({ success: false, error: err, message: "Cette page n'existe pas!" })
				}
				return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
			})
	} catch (err) {
		return res.status(500).json({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

userController.changePassword = (req, res) => {
	const { password } = req.body
	let idUser = req.user._id
	if (req.user.permission === ADMIN) {
		idUser = req.params.idUser
	} else {
		permission = req.user.permission
		status = req.user.status
	}

	if (!idUser || !password || password.length < 8) {
		return res.status(422).json({
			success: false,
			message: `Une erreur s'est produite, le server n'a pas eu suffisament d'information pour enregistrer votre requête ou le mot de passe n'est pas suffisament sécuritaire.`
		})
	}

	bcrypt.hash(password, 12).then(hashedPassword => {
		const data = {
			password: hashedPassword,
			updatedBy: req.user._id
		}
		try {
			User.findOneAndUpdate({ _id: idUser }, { $set: data }, { new: true })
				.then(updatedData => {
					userEmail.changePasswordEmail(updatedData.email, { name: updatedData.name })
					return res.json({
						success: true,
						message: `Le nouveau mot de passe pour "${updatedData.name}" a été correctement sauvegardé`
					})
				})
				.catch(err => {
					if (!mongoose.isValidObjectId(idUser)) {
						return res.status(404).json({ success: false, error: err, message: "Cette page n'existe pas!" })
					}
					return res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" })
				})
		} catch (err) {
			return res.status(500).json({ success: false, errors: err, message: 'Un problème est survenu' })
		}
	})
}

/**
 * Suprime un utilisateur selon un ID
 *
 * @param {*} req
 * @param {*} res
 */
userController.delete = (req, res) => {
	const idUser = req.params.idUser

	if (!idUser) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}

	User.findByIdAndDelete({ _id: idUser }, function (err) {
		if (err) {
			return res.status(403).json({ success: false, errors: err, message: 'Opération interdite' })
		}
		return res.json({
			success: true,
			message: `L'utilisateur a été supprimé!`
		})
	})
}

module.exports = {
	userController
}
