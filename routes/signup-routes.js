const { postNewSignUp } = require('../controllers/postNewSignUp.controllers')

const signupRouter = require('express').Router()

signupRouter.post('/',postNewSignUp)

module.exports = signupRouter