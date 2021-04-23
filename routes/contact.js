const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')

const { contactController } = require('../controllers/contactController')
const { permit } = require('../middlewares/permit')

const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

//contacts
router.get(
	'/contact',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	contactController.getAllContacts
)
router.get('/contact/:idContact', requireLogin, contactController.getOneContact)
router.get(
	'/customer/:idCustomer/contact',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	contactController.getAllContactsFromCustomer
)
//ajout d'un contact
router.post(
	'/customer/:idCustomer/contact',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	contactController.createContact
)
//modification d'un contact
router.put(
	'/contact/:idContact',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	contactController.updateContact
)
router.delete(
	'/contact/:idContact',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	contactController.deleteContact
)

//export
router.get('/export/contacts', [requireLogin, permit(ADMIN)], contactController.exportContacts)
router.put('/import/contacts', [requireLogin, permit(ADMIN)], contactController.importContacts)

module.exports = router
