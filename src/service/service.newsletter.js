const Newsletter = require('../model/model.newsletter');

class NewsletterService {
    // Get all newsletters - filtered by adminId
    async getAll(adminId, filters = {}) {
        const query = { adminId };

        if (filters.status) {
            query.status = filters.status;
        }

        const newsletters = await Newsletter.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return {
            newsletters,
            total: newsletters.length
        };
    }

    // Get by ID - verify adminId ownership
    async getById(id, adminId) {
        return await Newsletter.findOne({ _id: id, adminId })
            .populate('createdBy', 'name email');
    }

    // Create - requires adminId
    async create(data, userId, adminId) {
        const newsletter = new Newsletter({
            ...data,
            adminId,
            createdBy: userId,
            targetAudience: data.targetAudience || 'all'
        });

        await newsletter.save();
        return newsletter;
    }

    // Update - verify adminId ownership
    async update(id, data, adminId) {
        const newsletter = await Newsletter.findOneAndUpdate(
            { _id: id, adminId },
            { $set: { ...data, updatedAt: Date.now() } },
            { new: true }
        );
        return newsletter;
    }

    // Delete - verify adminId ownership
    async delete(id, adminId) {
        return await Newsletter.findOneAndDelete({ _id: id, adminId });
    }

    // Schedule - verify adminId ownership
    async schedule(id, scheduledAt, adminId) {
        const newsletter = await Newsletter.findOneAndUpdate(
            { _id: id, adminId },
            {
                $set: {
                    status: 'scheduled',
                    scheduledAt: new Date(scheduledAt),
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );
        return newsletter;
    }

    // Send - verify adminId ownership
    async send(id, adminId) {
        const newsletter = await Newsletter.findOne({ _id: id, adminId });
        if (!newsletter) {
            throw new Error('Newsletter not found');
        }

        // TODO: Implement actual email sending logic
        // For now, simulate sending
        try {
            // Calculate recipient count based on targetAudience
            let recipientCount = 0;
            switch (newsletter.targetAudience) {
                case 'all':
                    recipientCount = 100; // Placeholder - should query actual users
                    break;
                case 'alumni':
                    recipientCount = 60; // Placeholder
                    break;
                case 'students':
                    recipientCount = 40; // Placeholder
                    break;
                case 'specific_batch':
                case 'specific_department':
                    recipientCount = 20; // Placeholder
                    break;
            }

            newsletter.status = 'sent';
            newsletter.sentAt = new Date();
            newsletter.recipientCount = recipientCount;
            newsletter.updatedAt = Date.now();
            await newsletter.save();

            return newsletter;
        } catch (error) {
            newsletter.status = 'draft';
            newsletter.updatedAt = Date.now();
            await newsletter.save();
            throw error;
        }
    }

    // Track open - verify adminId ownership
    async trackOpen(id, adminId) {
        return await Newsletter.findOneAndUpdate(
            { _id: id, adminId },
            { $inc: { openCount: 1 } },
            { new: true }
        );
    }

    // Track click - verify adminId ownership
    async trackClick(id, adminId) {
        return await Newsletter.findOneAndUpdate(
            { _id: id, adminId },
            { $inc: { clickCount: 1 } },
            { new: true }
        );
    }

    // Get stats - filtered by adminId
    async getStats(adminId) {
        const matchStage = { adminId };

        const total = await Newsletter.countDocuments(matchStage);
        const sent = await Newsletter.countDocuments({ ...matchStage, status: 'sent' });
        const scheduled = await Newsletter.countDocuments({ ...matchStage, status: 'scheduled' });
        const drafts = await Newsletter.countDocuments({ ...matchStage, status: 'draft' });

        const sentNewsletters = await Newsletter.find({ ...matchStage, status: 'sent' });
        const totalRecipients = sentNewsletters.reduce((acc, n) => acc + (n.recipientCount || 0), 0);
        const totalOpened = sentNewsletters.reduce((acc, n) => acc + (n.openCount || 0), 0);

        return {
            total,
            sent,
            scheduled,
            drafts,
            totalRecipients,
            totalOpened,
            avgOpenRate: totalRecipients > 0 ? (totalOpened / totalRecipients * 100).toFixed(2) : 0
        };
    }
}

module.exports = new NewsletterService();
