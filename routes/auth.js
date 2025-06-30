const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword);
router.post(
  "/login",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("please enter a valid email address")
      .custom(async (value, { req }) => {
        try {
          const user = await User.findOne({ email: value });
          if (!user) {
            throw new Error("Invalid email or password");
          }
          req.user = user;
          return true;
        } catch (err) {
          throw new Error(
            err.message || "Something went wrong with email address"
          );
        }
      }),

    body("password", "Invalid email or password")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .custom(async (value, { req }) => {
        try {
          const matchPass = await bcrypt.compare(value, req.user.password);
          if (!matchPass) {
            throw new Error("Invalid Email or password");
          }
        } catch (err) {
          throw new Error(err.message || "Something went wrong with password");
        }
      })
      .trim(),
  ],
  authController.postLogin
);
router.post("/logout", authController.postLogout);
router.post(
  "/signup",
  [
    //when using `check` it searches for it in header or body of the request
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please Enter a valid Email")
      .custom(async (value, { req }) => {
        try {
          const existUser = await User.findOne({ email: value });
          if (existUser) {
            throw new Error("Email already exists, please pick another email");
          }
          return true;
        } catch (err) {
          throw new Error(
            err.message || "Something went wrong during validating your email"
          );
        }
      }),
    //when using body it checks for password in the body of the request
    body(
      "password",
      "Please enter a password with at least 5 characters and only use text and numbers"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error("Passwords must match");
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);
router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
