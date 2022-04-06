const express = require("express");
const router = express.Router();
const categories = require("../controllers/categoriesController");
const auth = require("../middlewares/authentication");
const upload = require("../middlewares/categoriesIcon");
const multer = require("multer");
const form = multer();

router.post("/", form.any(), auth, categories.postCategory);
router.get("/", auth, categories.getCategory);
router.put("/:id", auth, upload("categoryIcon"), categories.updateCategory);
router.delete("/:id", categories.deleteCategory);

module.exports = router;
