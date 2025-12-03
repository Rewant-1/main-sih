const express = require('express');
const router = express.Router();
const newsletterController = require('../controller/controller.newsletter');
const { protect, authorize } = require('../middleware/middleware.auth');

// Public routes (none for newsletters)

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', newsletterController.getStats);
router.get('/', newsletterController.getAll);
router.get('/:id', newsletterController.getById);
router.post('/', newsletterController.create);
router.put('/:id', newsletterController.update);
router.delete('/:id', newsletterController.delete);
router.post('/:id/schedule', newsletterController.schedule);
router.post('/:id/send', newsletterController.send);

module.exports = router;
