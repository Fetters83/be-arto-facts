const { postAuthentication } = require('../controllers/login.controller')

const loginRouter = require('express').Router()

loginRouter.post('/',postAuthentication)

module.exports = loginRouter

