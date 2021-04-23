const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')
const { userController } = require('../controllers/userController')
const { permit } = require('../middlewares/permit')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

//customers
router.get('/user', requireLogin, userController.getAll)
router.get('/user/:idUser', requireLogin, userController.getOne)
router.get('/profile', requireLogin, userController.getProfile)

router.post('/user', [requireLogin, permit(ADMIN)], userController.create)
router.put('/user/:idUser', requireLogin, userController.update)
router.patch('/user/status/:idUser', [requireLogin, permit(ADMIN)], userController.changeStatus)
router.patch('/user/password/:idUser', requireLogin, userController.changePassword)

router.delete('/user/:idUser', [requireLogin, permit(ADMIN)], userController.delete)

// router.post('/import/customers', requireLogin, userController.exportCustomer)
module.exports = router
