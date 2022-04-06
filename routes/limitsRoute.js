const express = require('express')
const router = express.Router()
const limit = require('../controllers/limitsController')
const auth = require('../middlewares/authentication')
const multer = require('multer');

router.post("/", auth, limit.postLimit )
router.get("/wholelimit", limit.getAllLimit)
router.get('/', auth,limit.getLimit)
router.put("/", auth,limit.updateLimit)
router.delete("/", auth, limit.deleteLimit)

module.exports = router