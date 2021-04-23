const express = require('express')
const router = express.Router()
const { requireLogin } = require('../middlewares/requireLogin')

const { activityController } = require('../controllers/activityController')
const { permit } = require('../middlewares/permit')

const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission

//activités
router.get('/activity', requireLogin, activityController.getAllActivities)
router.get('/activity/:idActivity', requireLogin, activityController.getOneActivity)
router.get('/customer/:idCustomer/activity', requireLogin, activityController.getAllActivitiesFromCustomer)
router.post('/customer/:idCustomer/activity', requireLogin, activityController.createActivity)
router.put('/activity/:idActivity', requireLogin, activityController.updateActivity)
router.delete('/activity/:idActivity', requireLogin, activityController.deleteActivity)

module.exports = router
