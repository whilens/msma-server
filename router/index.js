const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const smsRouter = require('./smsRouter')
const promoRouter = require('./promoRouter')
const fighterRouter = require('./fighterRouter')
const promoterRouter = require('./promoterRouter')
const chatRouter = require('./chatRouter')
const fightResponseRouter = require('./fightResponseRouter')
const promoMiddleware = require('../middleware/promoMiddleware')
const fighterMiddleware = require('../middleware/fighterMiddleware')
const authMiddleware = require('../middleware/authMiddleware')



router.use('/user', userRouter)
router.use('/promo', authMiddleware, promoMiddleware, promoRouter)
router.use('/fighter', authMiddleware, fighterMiddleware, fighterRouter)
router.use('/promoter', authMiddleware, promoterRouter)
router.use('/sms', smsRouter)
router.use('/chat', chatRouter)
router.use('/fight-response', fightResponseRouter)

module.exports = router
