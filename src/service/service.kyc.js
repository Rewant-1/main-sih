const KYC = require("../model/model.kyc");
const User = require("../model/model.user");
const auditLogService = require("./service.auditLog");

class KYCService {
  /**
   * Submit a new KYC request
   */
  async submitKYC({
    userId,
    type,
    documents,
    verificationData,
    college,
    priority = "normal"
  }) {
    // Check for existing pending KYC of same type
    const existingKYC = await KYC.findOne({
      user: userId,
      type,
      status: { $in: ["pending", "under_review"] }
    });

    if (existingKYC) {
      throw new Error(`A ${type} verification is already in progress`);
    }

    const kyc = new KYC({
      user: userId,
      type,
      documents,
      verificationData,
      college,
      priority
    });

    await kyc.save();

    await auditLogService.log({
      action: "KYC_SUBMIT",
      resourceType: "KYC",
      resourceId: kyc._id,
      actor: userId,
      metadata: { type, documentsCount: documents.length }
    });

    return kyc;
  }

  /**
   * Get KYC by ID
   */
  async getById(id) {
    return KYC.findById(id)
      .populate("user", "name email userType")
      .populate("reviewedBy", "name email")
      .lean();
  }

  /**
   * Get KYC requests for a user
   */
  async getUserKYC(userId) {
    return KYC.find({ user: userId })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get pending KYC requests for review
   */
  async getPendingReviews({
    college,
    type,
    priority,
    page = 1,
    limit = 20
  }) {
    const query = {
      status: { $in: ["pending", "under_review"] }
    };

    if (college) query.college = college;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    // Sort by priority and age
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };

    const [kycs, total] = await Promise.all([
      KYC.find(query)
        .populate("user", "name email userType")
        .sort({ priority: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      KYC.countDocuments(query)
    ]);

    // Manual sort by priority enum
    kycs.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    return {
      kycs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Start reviewing a KYC
   */
  async startReview(kycId, reviewerId) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    if (kyc.status !== "pending") {
      throw new Error(`Cannot start review - status is ${kyc.status}`);
    }

    kyc.status = "under_review";
    kyc.reviewedBy = reviewerId;
    await kyc.save();

    return kyc;
  }

  /**
   * Approve KYC
   */
  async approveKYC(kycId, reviewerId, notes = "") {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    if (!["pending", "under_review"].includes(kyc.status)) {
      throw new Error(`Cannot approve - status is ${kyc.status}`);
    }

    kyc.status = "approved";
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.reviewNotes = notes;
    
    // Mark all documents as verified
    kyc.documents = kyc.documents.map(doc => ({
      ...doc,
      isVerified: true
    }));

    await kyc.save();

    // Update user verification status if this is alumni verification
    if (kyc.type === "alumni_verification") {
      await User.findByIdAndUpdate(kyc.user, {
        isVerified: true,
        verifiedAt: new Date()
      });
    }

    await auditLogService.log({
      action: "KYC_APPROVE",
      resourceType: "KYC",
      resourceId: kycId,
      actor: reviewerId,
      metadata: { type: kyc.type, userId: kyc.user }
    });

    return kyc;
  }

  /**
   * Reject KYC
   */
  async rejectKYC(kycId, reviewerId, rejectionReason, requiresResubmission = true) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    if (!["pending", "under_review"].includes(kyc.status)) {
      throw new Error(`Cannot reject - status is ${kyc.status}`);
    }

    kyc.status = requiresResubmission ? "resubmission_required" : "rejected";
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = rejectionReason;

    await kyc.save();

    await auditLogService.log({
      action: "KYC_REJECT",
      resourceType: "KYC",
      resourceId: kycId,
      actor: reviewerId,
      metadata: { 
        type: kyc.type, 
        userId: kyc.user,
        rejectionReason,
        requiresResubmission
      }
    });

    return kyc;
  }

  /**
   * Resubmit KYC
   */
  async resubmitKYC(kycId, userId, updates) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    if (kyc.user.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (kyc.status !== "resubmission_required") {
      throw new Error("Resubmission not required");
    }

    // Add new documents
    if (updates.documents && updates.documents.length > 0) {
      kyc.documents = [...kyc.documents, ...updates.documents];
    }

    // Update verification data
    if (updates.verificationData) {
      kyc.verificationData = {
        ...kyc.verificationData,
        ...updates.verificationData
      };
    }

    kyc.status = "pending";
    kyc.resubmissionCount += 1;
    kyc.lastResubmittedAt = new Date();
    kyc.rejectionReason = null;
    kyc.reviewedBy = null;
    kyc.reviewedAt = null;
    kyc.reviewNotes = null;

    await kyc.save();

    return kyc;
  }

  /**
   * Add document to existing KYC
   */
  async addDocument(kycId, userId, document) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    if (kyc.user.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (!["pending", "resubmission_required"].includes(kyc.status)) {
      throw new Error("Cannot add documents at this stage");
    }

    kyc.documents.push({
      ...document,
      uploadedAt: new Date()
    });

    await kyc.save();
    return kyc;
  }

  /**
   * Get KYC statistics
   */
  async getStats(college = null) {
    const match = college ? { college } : {};

    const [statusStats, typeStats, avgProcessingTime] = await Promise.all([
      KYC.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      KYC.aggregate([
        { $match: match },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
      KYC.aggregate([
        {
          $match: {
            ...match,
            status: { $in: ["approved", "rejected"] },
            reviewedAt: { $exists: true }
          }
        },
        {
          $project: {
            processingTime: {
              $subtract: ["$reviewedAt", "$createdAt"]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: "$processingTime" }
          }
        }
      ])
    ]);

    const stats = {
      byStatus: {},
      byType: {},
      avgProcessingTimeMs: avgProcessingTime[0]?.avgTime || 0,
      avgProcessingTimeHours: (avgProcessingTime[0]?.avgTime || 0) / (1000 * 60 * 60)
    };

    statusStats.forEach(s => {
      stats.byStatus[s._id] = s.count;
    });

    typeStats.forEach(s => {
      stats.byType[s._id] = s.count;
    });

    return stats;
  }

  /**
   * Get verification status for user
   */
  async getVerificationStatus(userId) {
    const kycs = await KYC.find({ user: userId }).lean();

    const status = {
      isFullyVerified: false,
      verifications: {}
    };

    for (const kyc of kycs) {
      if (!status.verifications[kyc.type] || 
          kyc.createdAt > status.verifications[kyc.type].createdAt) {
        status.verifications[kyc.type] = {
          status: kyc.status,
          createdAt: kyc.createdAt,
          reviewedAt: kyc.reviewedAt
        };
      }
    }

    // Check if alumni_verification is approved
    status.isFullyVerified = 
      status.verifications.alumni_verification?.status === "approved";

    return status;
  }
}

module.exports = new KYCService();
