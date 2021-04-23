const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')

const { noteController } = require('../controllers/noteController')
const { permit } = require('../middlewares/permit')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

//note
router.get('/notes', requireLogin, noteController.getAllNotes)
router.get('/notes/:idNote', requireLogin, noteController.getOneNote)
router.get('/customer/:idCustomer/note', requireLogin, noteController.getAllNotesFromCustomer)

router.post('/customer/:idCustomer/note', requireLogin, noteController.create)
router.put('/notes/:idNote', [requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)], noteController.update)
router.delete('/notes/:idNote', [requireLogin, permit(ADMIN, COLLABORATOR, SELLER, DISPATCHER)], noteController.delete)

module.exports = router
