const express = require("express");
const router = express.Router();

const AuthController = require("../controller/controller.auth");
const { internalAuth } = require("../middleware/middleware.auth");

router.post("/register/alumni", AuthController.registerAlumni);
router.post("/login", AuthController.login);
router.post(
    "/verify/:alumniId",
    internalAuth,
    AuthController.verifyAlumni
);

module.exports = router;
