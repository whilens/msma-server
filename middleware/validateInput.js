const {body, validationResult} = require('express-validator')

const validateInput = [
    body('email').notEmpty().withMessage('Email не должен быть пустым'),
    body('password').notEmpty().withMessage('Пароль не должен быть пустым'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        next()
    }
]

module.exports = validateInput
