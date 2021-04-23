const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')

const authController = {}

authController.signUp = (req, res) => {
	const { name, email, password } = req.body
	if (!name || !email || !password) {
		return res.status(422).json({ error: 'Merci de remplir tous les champs' })
	}

	User.findOne({ email: email })
		.then(savedUser => {
			if (savedUser) {
				return res
					.status(422)
					.json({ error: 'Cet utilisateur existe déjà! Veuillez utiliser un autre utilisateur' })
			}

			bcrypt.hash(password, 12).then(hashedPassword => {
				const user = new User({
					name,
					email,
					password: hashedPassword
				})
				user.save()
					.then(user => {
						res.json({ success: true, message: 'Utilisateur enregistrer' })
					})
					.catch(err => console.log(err))
			})
		})
		.catch(err => console.log(err))
}

authController.signIn = (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		return res.json({ error: 'please add email or password' })
	}

	User.findOne({ email: email })
		.then(savedUser => {
			if (!savedUser) {
				return res.json({ error: 'Invalid email or password' })
			}
			bcrypt
				.compare(password, savedUser.password)
				.then(doMatch => {
					if (doMatch) {
						const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, { expiresIn: '300d' })
						return res.json({
							success: true,
							token,
							permission: savedUser.permission,
							user: savedUser._id,
							message: 'Bienvenue!'
						})
						// res.json({ message: 'Successfully signed in' })
					} else {
						return res.json({ error: 'Invalid email or password' })
					}
				})
				.catch(err => console.log(err))
		})
		.catch(err => console.log(err))
}

authController.login = (req, res) => {
	if (req.user) {
		return res.json({ success: true, message: 'Vous êtes maintenant connecté' })
	}
	return res.status(403).json({ success: false, message: `Nous ne pouvons se connecté` })
}

authController.logout = (req, res) => {
	// remove the req.user property and clear the login session
	delete req.user
	// destroy session data
	req.session = null
	// redirect to homepage
	res.send({
		success: true,
		status: '200',
		responseType: 'string',
		response: 'success',
		message: 'Vous avez été déconnecté'
	})
}
module.exports = {
	authController
}
