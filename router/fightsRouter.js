const Router = require('express')
const router = new Router()

const authMiddleware = require('../middleware/authMiddleware')
const fightsController = require('../controller/fights/fightsController')

router.get('/fights', authMiddleware, fightsController.getAllFights)

module.exports = router