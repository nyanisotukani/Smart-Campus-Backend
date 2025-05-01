const router = require('express').Router()
const {createReport} = require('../controllers/maintenanceController')

router.post('/', createReport);

module.exports = router;