const newsletterService = require('../service/service.newsletter');

// All controllers now use req.admin.adminId for college isolation

exports.getAll = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const result = await newsletterService.getAll(adminId, req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const newsletter = await newsletterService.getById(req.params.id, adminId);
        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }
        res.json({
            success: true,
            data: newsletter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const newsletter = await newsletterService.create(req.body, req.admin._id, adminId);
        res.status(201).json({
            success: true,
            data: newsletter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const newsletter = await newsletterService.update(req.params.id, req.body, adminId);
        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }
        res.json({
            success: true,
            data: newsletter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const newsletter = await newsletterService.delete(req.params.id, adminId);
        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }
        res.json({
            success: true,
            message: 'Newsletter deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.schedule = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const { scheduledAt } = req.body;
        if (!scheduledAt) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled date is required'
            });
        }

        const newsletter = await newsletterService.schedule(req.params.id, scheduledAt, adminId);
        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }
        res.json({
            success: true,
            data: newsletter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.send = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const newsletter = await newsletterService.send(req.params.id, adminId);
        res.json({
            success: true,
            data: newsletter,
            message: 'Newsletter is being sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const stats = await newsletterService.getStats(adminId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
