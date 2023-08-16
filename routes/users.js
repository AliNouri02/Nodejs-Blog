const { Router } = require("express");
const userController = require('../controllers/userController');
const { authenticated } = require('../middlewares/auth');

const router = new Router();


//  @desc   Login Page
//  @route  GET /users/login
router.get("/login", userController.login);

//  @desc   logout Handle
//  @route  GET /users/logout
router.get("/logout", authenticated, userController.logout);

//  @desc   Login Handel
//  @route  GET /users/login
router.post("/login", userController.handelLogin, userController.rememberMe);

//  @desc   Register Page
//  @route  GET /users/register
router.get("/register", userController.register);

//  @desc   Forget Password Page
//  @route  GET /users/forget-password
router.get("/forget-password", userController.forgetPassword);

//  @desc   Reset Password Page
//  @route  GET /users/reset-password/:token
router.get("/reset-password/:token", userController.resetPassword);

//  @desc   Handle Forget Password
//  @route  POST /users/forget-password
router.post("/forget-password", userController.handleForgetPassword);

//  @desc   Handle reset Password
//  @route  POST /users/reset-password/:id
router.post("/reset-password/:id", userController.handleResetPassword);

//  @desc   Register Handle
//  @route  POST /users/register
router.post("/register", userController.createUser);

module.exports = router;
