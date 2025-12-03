const express = require("express");
const router = express.Router();
const multer = require("multer");
const bulkImportController = require("../controller/controller.bulkImport");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || 
        file.mimetype === "application/vnd.ms-excel" ||
        file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Get template columns for import type
router.get("/template/:importType", bulkImportController.getTemplateColumns);

// Get list of imports
router.get("/", checkRole(["Admin"]), bulkImportController.getImports);

// Get import status
router.get("/:importId/status", bulkImportController.getImportStatus);

// Get import results
router.get("/:importId/results", bulkImportController.getImportResults);

// Create new import (upload CSV)
router.post("/", checkRole(["Admin"]), upload.single("file"), bulkImportController.createImport);

// Confirm and process import
router.post("/:importId/process", checkRole(["Admin"]), bulkImportController.processImport);

// Cancel import
router.delete("/:importId", checkRole(["Admin"]), bulkImportController.cancelImport);

module.exports = router;
