const express = require('express');
const router = express.Router();
const newsletterController = require('../controller/controller.newsletter');
const { verifyAdmin } = require('../middleware/middleware.adminAuth');

// ALL routes require admin authentication for college isolation
router.use(verifyAdmin);

// Newsletter routes - all protected by admin auth
router.get('/stats', newsletterController.getStats);
router.get('/', newsletterController.getAll);
router.get('/:id', newsletterController.getById);
router.post('/', newsletterController.create);
router.put('/:id', newsletterController.update);
router.delete('/:id', newsletterController.delete);
router.post('/:id/schedule', newsletterController.schedule);
router.post('/:id/send', newsletterController.send);

module.exports = router;
