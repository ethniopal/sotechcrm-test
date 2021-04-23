const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')

const { attachmentController } = require('../controllers/attachmentController')
const { permit } = require('../middlewares/permit')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

router.get('/attachment', requireLogin, attachmentController.getAllAttachments)
router.get('/customer/:idCustomer/attachment', requireLogin, attachmentController.getAllAttachmentsFromCustomer)

router.post(
	'/customer/:idCustomer/upload-single',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	attachmentController.uploadAttachment
)
router.post(
	'/customer/:idCustomer/upload-multiple',
	[requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)],
	attachmentController.uploadMultipleAttachments
)
router.get('/attachment/:idAttachment', requireLogin, attachmentController.downloadAttachment)
router.delete(
	'/attachment/:idAttachment',
	[requireLogin, permit(ADMIN, COLLABORATOR)],
	attachmentController.deleteAttachment
)

module.exports = router
