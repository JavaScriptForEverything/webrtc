const { Router } = require('express')
const pageController = require('../controllers/pageController')

// => 	/
const router = Router()

router.get('/', pageController.home)


module.exports = router