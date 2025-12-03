const newsletterService = require('../service/service.newsletter');

exports.getAll = async (req, res) => {
    try {
        const result = await newsletterService.getAll(req.query);
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
        const newsletter = await newsletterService.getById(req.params.id);
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
        const newsletter = await newsletterService.create(req.body, req.user?.userId);
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
        const newsletter = await newsletterService.update(req.params.id, req.body);
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
        const newsletter = await newsletterService.delete(req.params.id);
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
        const { scheduledAt } = req.body;
        if (!scheduledAt) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled date is required'
            });
        }
        
        const newsletter = await newsletterService.schedule(req.params.id, scheduledAt);
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
        const newsletter = await newsletterService.send(req.params.id);
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
        const stats = await newsletterService.getStats();
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
