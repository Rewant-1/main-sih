const express = require("express");
const router = express.Router();
const multer = require("multer");
const kycController = require("../controller/controller.kyc");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"), false);
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// User routes
// Get my KYC status
router.get("/me", kycController.getMyKYC);

// Submit new KYC
router.post("/", upload.array("documents", 5), kycController.submitKYC);

// Get specific KYC
router.get("/:kycId", kycController.getKYCById);

// Resubmit KYC
router.put("/:kycId/resubmit", upload.array("documents", 5), kycController.resubmitKYC);

// Add document to KYC
router.post("/:kycId/documents", upload.single("document"), kycController.addDocument);

// Admin routes
// Get pending reviews
router.get("/admin/pending", checkRole(["Admin"]), kycController.getPendingReviews);

// Get KYC statistics
router.get("/admin/stats", checkRole(["Admin"]), kycController.getKYCStats);

// Start review
router.post("/:kycId/review/start", checkRole(["Admin"]), kycController.startReview);

// Approve KYC
router.post("/:kycId/approve", checkRole(["Admin"]), kycController.approveKYC);

// Reject KYC
router.post("/:kycId/reject", checkRole(["Admin"]), kycController.rejectKYC);

module.exports = router;
