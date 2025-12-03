const invitationService = require("../service/service.invitation");

// Create a single invitation
const createInvitation = async (req, res) => {
  try {
    const { email, name, type, prefillData } = req.body;
    const userId = req.user.userId;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Email and type are required"
      });
    }

    const invitation = await invitationService.createInvitation({
      email,
      name,
      type,
      invitedBy: userId,
      college: req.body.college,
      prefillData
    });

    res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: invitation
    });
  } catch (error) {
    console.error("Create invitation error:", error);
    res.status(error.message.includes("already exists") ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// Create bulk invitations
const createBulkInvitations = async (req, res) => {
  try {
    const { invitations } = req.body;
    const userId = req.user.userId;

    if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invitations array is required"
      });
    }

    const result = await invitationService.createBulkInvitations(
      invitations,
      userId,
      req.body.college
    );

    res.status(201).json({
      success: true,
      message: `Created ${result.created.length} invitations`,
      data: {
        created: result.created.length,
        skipped: result.skipped.length,
        failed: result.failed.length,
        details: result
      }
    });
  } catch (error) {
    console.error("Create bulk invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create invitations",
      error: error.message
    });
  }
};

// Validate invitation token
const validateToken = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await invitationService.validateToken(token);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.reason
      });
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        invitation: {
          email: result.invitation.email,
          name: result.invitation.name,
          type: result.invitation.type,
          prefillData: result.invitation.prefillData,
          expiresAt: result.invitation.expiresAt
        }
      }
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Accept invitation and create account
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, password, ...additionalData } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const result = await invitationService.acceptInvitation(token, {
      name,
      password,
      ...additionalData
    });

    // Generate JWT token for the new user
    const jwt = require("jsonwebtoken");
    const authToken = jwt.sign(
      { userId: result.user._id, userType: result.user.userType },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          userType: result.user.userType
        },
        token: authToken
      }
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Resend invitation
const resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await invitationService.resendInvitation(invitationId);

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
      data: invitation
    });
  } catch (error) {
    console.error("Resend invitation error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel invitation
const cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    await invitationService.cancelInvitation(invitationId);

    res.status(200).json({
      success: true,
      message: "Invitation cancelled"
    });
  } catch (error) {
    console.error("Cancel invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel invitation",
      error: error.message
    });
  }
};

// Get invitations list
const getInvitations = async (req, res) => {
  try {
    const { college, status, type, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const userType = req.user.userType;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Non-admins can only see invitations they sent
    if (userType !== "Admin") {
      filters.invitedBy = userId;
    }

    if (college) filters.college = college;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const result = await invitationService.getInvitations(filters);

    res.status(200).json({
      success: true,
      data: result.invitations,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
      error: error.message
    });
  }
};

// Get invitation statistics
const getInvitationStats = async (req, res) => {
  try {
    const { college } = req.query;

    const stats = await invitationService.getStats(college);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get invitation stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitation statistics",
      error: error.message
    });
  }
};

// Track email open (pixel tracking)
const trackOpen = async (req, res) => {
  try {
    const { token } = req.params;
    await invitationService.markAsOpened(token);
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    
    res.set("Content-Type", "image/gif");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pixel);
  } catch (error) {
    // Silent fail for tracking
    res.status(200).send();
  }
};

module.exports = {
  createInvitation,
  createBulkInvitations,
  validateToken,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,
  getInvitations,
  getInvitationStats,
  trackOpen
};
