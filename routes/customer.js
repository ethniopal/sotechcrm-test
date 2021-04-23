const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')
const { customerController } = require('../controllers/customerController')
const { permit } = require('../middlewares/permit')

const { permission } = require('../constants/user')

const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

//customers
router.get('/customer', requireLogin, customerController.getAllCustomers)
router.get('/customer/:idCustomer', requireLogin, customerController.getOneCustomer)

router.post(
	'/customer',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	customerController.createCustomer
)
router.put(
	'/customer/:idCustomer',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	customerController.updateCustomer
)
router.delete('/customer/:idCustomer', [requireLogin, permit(ADMIN, COLLABORATOR)], customerController.deleteCustomer)
router.patch('/customer/:idCustomer', [requireLogin, permit(ADMIN, COLLABORATOR)], customerController.archiveCustomer)

//export
router.get('/export/customers', permit(ADMIN), customerController.exportCustomer)
router.put('/import/customers', permit(ADMIN), customerController.importCustomer)

// router.post('/import/customers', requireLogin, customerController.exportCustomer)
module.exports = router
