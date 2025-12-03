const Newsletter = require('../model/model.newsletter');

class NewsletterService {
    async getAll(filters = {}) {
        const query = {};
        
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

    async getById(id) {
        return await Newsletter.findById(id)
            .populate('createdBy', 'name email');
    }

    async create(data, userId) {
        const newsletter = new Newsletter({
            ...data,
            createdBy: userId,
            targetAudience: data.targetAudience || 'all'
        });
        
        await newsletter.save();
        return newsletter;
    }

    async update(id, data) {
        const newsletter = await Newsletter.findByIdAndUpdate(
            id,
            { $set: { ...data, updatedAt: Date.now() } },
            { new: true }
        );
        return newsletter;
    }

    async delete(id) {
        return await Newsletter.findByIdAndDelete(id);
    }

    async schedule(id, scheduledAt) {
        const newsletter = await Newsletter.findByIdAndUpdate(
            id,
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

    async send(id) {
        const newsletter = await Newsletter.findById(id);
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
                    recipientCount = 100; // Placeholder
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

    async trackOpen(id) {
        return await Newsletter.findByIdAndUpdate(
            id,
            { $inc: { openCount: 1 } },
            { new: true }
        );
    }

    async trackClick(id) {
        return await Newsletter.findByIdAndUpdate(
            id,
            { $inc: { clickCount: 1 } },
            { new: true }
        );
    }

    async getStats() {
        const total = await Newsletter.countDocuments();
        const sent = await Newsletter.countDocuments({ status: 'sent' });
        const scheduled = await Newsletter.countDocuments({ status: 'scheduled' });
        const drafts = await Newsletter.countDocuments({ status: 'draft' });
        
        const sentNewsletters = await Newsletter.find({ status: 'sent' });
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
