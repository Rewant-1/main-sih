const express = require("express");
const router = express.Router();

const AuthController = require("../controller/controller.auth");
const { internalAuth } = require("../middleware/middleware.auth");

router.post("/register/alumni", AuthController.registerAlumni);
router.post("/register/student", AuthController.registerStudent);
router.post("/login", AuthController.login);
router.post(
    "/verify/:alumniId",
    internalAuth,
    AuthController.verifyAlumni
);
router.get("/test", (req, res) => {
    console.log("auth working.");
    res.json({ success: true, message: "Auth routes working" });
});

module.exports = router;
