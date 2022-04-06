const express = require("express");
const router = express.Router();
const users = require("../controllers/usersController");
const passport = require("../middlewares/passport");
const multer = require("multer");
const form = multer();

router.post("/login", form.any(), users.login);
router.post("/register", form.any(), users.register);
router.get("/verify", users.verifyEmail);
router.post("/forgot", form.any(), users.forgotPassword);
router.put("/reset-password/:id/:token", form.any(), users.resetPassword);
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/failed", (req, res) =>
  res.send("You failed to login, please try again.")
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/v1/user/failed" }),
  users.google
);
router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);
router.get("/failed", (req, res) =>
  res.send("You failed to login, please try again.")
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/api/v1/user/failed" }),
  users.facebook
);

module.exports = router;
