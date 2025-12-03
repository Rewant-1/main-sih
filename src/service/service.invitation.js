const Invitation = require("../model/model.invitation");
const User = require("../model/model.user");
const auditLogService = require("./service.auditLog");
const crypto = require("crypto");

class InvitationService {
  /**
   * Create a new invitation
   */
  async createInvitation({
    email,
    name,
    type,
    invitedBy,
    college,
    prefillData,
    expiresIn = 7 * 24 * 60 * 60 * 1000 // 7 days default
  }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "sent"] }
    });

    if (existingInvitation) {
      // Resend logic - update token and expiry
      existingInvitation.token = crypto.randomBytes(32).toString('hex');
      existingInvitation.expiresAt = new Date(Date.now() + expiresIn);
      existingInvitation.status = "pending";
      existingInvitation.sendAttempts = 0;
      await existingInvitation.save();
      return existingInvitation;
    }

    const invitation = new Invitation({
      email: email.toLowerCase(),
      name,
      type,
      invitedBy,
      college,
      prefillData,
      expiresAt: new Date(Date.now() + expiresIn)
    });

    await invitation.save();

    await auditLogService.log({
      action: "INVITE_SENT",
      resourceType: "User",
      actor: invitedBy,
      metadata: { email, type, invitationId: invitation._id }
    });

    return invitation;
  }

  /**
   * Create multiple invitations
   */
  async createBulkInvitations(invitations, invitedBy, college) {
    const results = {
      created: [],
      skipped: [],
      failed: []
    };

    for (const inv of invitations) {
      try {
        const invitation = await this.createInvitation({
          email: inv.email,
          name: inv.name,
          type: inv.type,
          invitedBy,
          college,
          prefillData: inv.prefillData
        });
        results.created.push(invitation);
      } catch (error) {
        if (error.message.includes("already exists")) {
          results.skipped.push({ email: inv.email, reason: error.message });
        } else {
          results.failed.push({ email: inv.email, error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Get invitation by token
   */
  async getByToken(token) {
    const invitation = await Invitation.findOne({ token })
      .populate("invitedBy", "name email")
      .populate("college", "name");

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    return invitation;
  }

  /**
   * Validate invitation token
   */
  async validateToken(token) {
    const invitation = await this.getByToken(token);

    if (invitation.status === "accepted") {
      return { valid: false, reason: "Invitation already used" };
    }

    if (invitation.status === "cancelled") {
      return { valid: false, reason: "Invitation was cancelled" };
    }

    if (new Date() > invitation.expiresAt) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return { valid: false, reason: "Invitation has expired" };
    }

    return { valid: true, invitation };
  }

  /**
   * Accept invitation and create user
   */
  async acceptInvitation(token, userData) {
    const validation = await this.validateToken(token);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const invitation = validation.invitation;

    // Check if user was already created (shouldn't happen but safety check)
    if (invitation.createdUser) {
      throw new Error("User was already created for this invitation");
    }

    // Create user with provided data + prefill data
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = new User({
      name: userData.name || invitation.name,
      email: invitation.email,
      password: hashedPassword,
      userType: invitation.type === 'alumni' ? 'Alumni' : 
                invitation.type === 'student' ? 'Student' : 'Admin',
      isVerified: true, // Auto-verify invited users
      profileComplete: false
    });

    await user.save();

    // Update invitation
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.createdUser = user._id;
    await invitation.save();

    await auditLogService.log({
      action: "CREATE",
      resourceType: "User",
      resourceId: user._id,
      actor: user._id,
      metadata: { source: "invitation", invitationId: invitation._id }
    });

    return { user, invitation };
  }

  /**
   * Mark invitation as sent
   */
  async markAsSent(invitationId, success = true, error = null) {
    const update = {
      sendAttempts: { $inc: 1 },
      lastAttemptAt: new Date()
    };

    if (success) {
      update.status = "sent";
      update.sentAt = new Date();
    } else {
      update.lastError = error;
    }

    return Invitation.findByIdAndUpdate(invitationId, update, { new: true });
  }

  /**
   * Mark invitation as opened (for email tracking)
   */
  async markAsOpened(token) {
    return Invitation.findOneAndUpdate(
      { token, openedAt: null },
      { openedAt: new Date() },
      { new: true }
    );
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId) {
    return Invitation.findByIdAndUpdate(
      invitationId,
      { status: "cancelled" },
      { new: true }
    );
  }

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId) {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status === "accepted") {
      throw new Error("Cannot resend accepted invitation");
    }

    invitation.token = crypto.randomBytes(32).toString('hex');
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.status = "pending";
    await invitation.save();

    return invitation;
  }

  /**
   * Get invitations with filters
   */
  async getInvitations({
    invitedBy,
    college,
    status,
    type,
    page = 1,
    limit = 20
  }) {
    const query = {};
    if (invitedBy) query.invitedBy = invitedBy;
    if (college) query.college = college;
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      Invitation.find(query)
        .populate("invitedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invitation.countDocuments(query)
    ]);

    return {
      invitations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get invitation statistics
   */
  async getStats(college = null) {
    const match = college ? { college } : {};

    const stats = await Invitation.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      sent: 0,
      opened: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0
    };

    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    return result;
  }

  /**
   * Expire old invitations
   */
  async expireOldInvitations() {
    const result = await Invitation.updateMany(
      {
        status: { $in: ["pending", "sent"] },
        expiresAt: { $lt: new Date() }
      },
      { status: "expired" }
    );

    return result.modifiedCount;
  }
}

module.exports = new InvitationService();
