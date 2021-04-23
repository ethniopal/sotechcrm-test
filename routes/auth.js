const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const { requireLogin } = require('../middlewares/requireLogin')
const { permit } = require('../middlewares/permit')
const { authController } = require('../controllers/authController')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

router.get('/', (req, res) => {
	// require('../emails/config')
	res.send('')
})

router.post('/auth/signup', [requireLogin, permit(ADMIN)], authController.signUp)

router.post('/auth/signin', authController.signIn)

// router.post('/auth/loginCheck', authController.signIn)

router.get('/auth/login', requireLogin, authController.login)

router.post('/auth/logout', requireLogin, authController.logout)

module.exports = router
