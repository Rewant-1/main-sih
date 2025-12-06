const express = require("express");
const router = express.Router();

const AuthController = require("../controller/controller.auth");
const { internalAuth, authenticateToken } = require("../middleware/middleware.auth");

router.post("/register/alumni", AuthController.registerAlumni);
router.post("/register/student", AuthController.registerStudent);
// Admin registration - protected by internal API key
router.post("/register/admin", internalAuth, AuthController.registerAdmin);
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

// Dev helper: return decoded token payload for currently authenticated user
router.get('/me', authenticateToken, (req, res) => {
    // Return the `req.user` decoded by middleware
    res.json({ success: true, data: req.user || null });
});

module.exports = router;
