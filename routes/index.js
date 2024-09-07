const express = require('express')
const authController = require('../controller/authController')
const blogController = require('../controller/blogController')
const commentController = require('../controller/commentController')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/test', (req, res) => {
    res.send("testing route")
})
// register
router.post('/register', authController.register)
// login
router.post('/login', authController.login)
// logout
router.post('/logout', authController.logout)
// refresh 
router.get('/refresh', authController.refresh)
// blog
// create
router.post('/blog/create', auth, blogController.create)
// getall blog
router.get('/blog/getall', auth, blogController.getAll)
// get blog by id
router.get('/blog/:id', auth, blogController.getById)
// update blog
router.put('/blog/update', auth, blogController.update)
// delete 
router.delete('/blog/:id', auth, blogController.delete)
// Comment
// create 
router.post('/comment', auth, commentController.create)
// get
router.get('/comment/:id', auth, commentController.getById)
module.exports = router;
