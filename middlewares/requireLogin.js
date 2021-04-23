const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const userMsg = require('../constants/user')

const requireLogin = (req, res, next) => {
	const { authorization } = req.headers
	if (!authorization) {
		return res.status(401).json({ success: false, error: "Vous devez être connecté à l'application" })
	}
	const token = authorization.replace('Bearer ', '')
	jwt.verify(token, JWT_SECRET, (err, payload) => {
		if (err) {
			return res.status(401).json({ success: false, error: "Vous devez être connecté à l'application" })
		}
		const { _id } = payload
		User.findById(_id)
			.then(userData => {
				if (!userData) {
					return res.status(401).json({ success: false, error: "Vous devez être connecté à l'application" })
				}
				const { _id, name, email, permission, status } = userData
				const globalUser = { _id, name, email, permission, status }

				if (status !== userMsg.status.ACTIVE) {
					return res.status(403).json({ success: false, message: 'Votre compte a été désactiver' })
				}
				req.user = globalUser
				next()
			})
			.catch(console.log(err => console.log(err)))
	})
}

module.exports = {
	requireLogin
}
