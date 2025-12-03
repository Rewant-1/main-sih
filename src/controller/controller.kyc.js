const kycService = require("../service/service.kyc");
const auditLogService = require("../service/service.auditLog");

// Submit a new KYC request
const submitKYC = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, verificationData, priority } = req.body;

    // Handle uploaded documents
    const documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        documents.push({
          name: file.originalname,
          type: req.body.documentType || "other",
          url: file.path || file.location,
          publicId: file.filename,
          mimeType: file.mimetype,
          size: file.size
        });
      }
    }

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required"
      });
    }

    const kyc = await kycService.submitKYC({
      userId,
      type: type || "alumni_verification",
      documents,
      verificationData,
      college: req.body.college,
      priority
    });

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      data: kyc
    });
  } catch (error) {
    console.error("Submit KYC error:", error);
    res.status(error.message.includes("already in progress") ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get KYC status for current user
const getMyKYC = async (req, res) => {
  try {
    const userId = req.user.userId;

    const kycs = await kycService.getUserKYC(userId);
    const status = await kycService.getVerificationStatus(userId);

    res.status(200).json({
      success: true,
      data: {
        verificationStatus: status,
        submissions: kycs
      }
    });
  } catch (error) {
    console.error("Get my KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
      error: error.message
    });
  }
};

// Get pending KYC requests for review (admin)
const getPendingReviews = async (req, res) => {
  try {
    const { college, type, priority, page = 1, limit = 20 } = req.query;

    const result = await kycService.getPendingReviews({
      college,
      type,
      priority,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result.kycs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get pending reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending reviews",
      error: error.message
    });
  }
};

// Get specific KYC by ID
const getKYCById = async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await kycService.getById(kycId);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found"
      });
    }

    // Check authorization
    const userId = req.user.userId;
    const userType = req.user.userType;
    if (userType !== "Admin" && kyc.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      data: kyc
    });
  } catch (error) {
    console.error("Get KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KYC",
      error: error.message
    });
  }
};

// Start reviewing a KYC
const startReview = async (req, res) => {
  try {
    const { kycId } = req.params;
    const reviewerId = req.user.userId;

    const kyc = await kycService.startReview(kycId, reviewerId);

    res.status(200).json({
      success: true,
      message: "Review started",
      data: kyc
    });
  } catch (error) {
    console.error("Start review error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Approve KYC
const approveKYC = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.userId;

    const kyc = await kycService.approveKYC(kycId, reviewerId, notes);

    res.status(200).json({
      success: true,
      message: "KYC approved",
      data: kyc
    });
  } catch (error) {
    console.error("Approve KYC error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reject KYC
const rejectKYC = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { rejectionReason, requiresResubmission = true } = req.body;
    const reviewerId = req.user.userId;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const kyc = await kycService.rejectKYC(kycId, reviewerId, rejectionReason, requiresResubmission);

    res.status(200).json({
      success: true,
      message: requiresResubmission ? "KYC requires resubmission" : "KYC rejected",
      data: kyc
    });
  } catch (error) {
    console.error("Reject KYC error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Resubmit KYC
const resubmitKYC = async (req, res) => {
  try {
    const { kycId } = req.params;
    const userId = req.user.userId;
    const { verificationData } = req.body;

    // Handle uploaded documents
    const documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        documents.push({
          name: file.originalname,
          type: req.body.documentType || "other",
          url: file.path || file.location,
          publicId: file.filename,
          mimeType: file.mimetype,
          size: file.size
        });
      }
    }

    const kyc = await kycService.resubmitKYC(kycId, userId, {
      documents,
      verificationData
    });

    res.status(200).json({
      success: true,
      message: "KYC resubmitted",
      data: kyc
    });
  } catch (error) {
    console.error("Resubmit KYC error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add document to KYC
const addDocument = async (req, res) => {
  try {
    const { kycId } = req.params;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const document = {
      name: req.file.originalname,
      type: req.body.documentType || "other",
      url: req.file.path || req.file.location,
      publicId: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    const kyc = await kycService.addDocument(kycId, userId, document);

    res.status(200).json({
      success: true,
      message: "Document added",
      data: kyc
    });
  } catch (error) {
    console.error("Add document error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get KYC statistics
const getKYCStats = async (req, res) => {
  try {
    const { college } = req.query;

    const stats = await kycService.getStats(college);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get KYC stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KYC statistics",
      error: error.message
    });
  }
};

module.exports = {
  submitKYC,
  getMyKYC,
  getPendingReviews,
  getKYCById,
  startReview,
  approveKYC,
  rejectKYC,
  resubmitKYC,
  addDocument,
  getKYCStats
};
