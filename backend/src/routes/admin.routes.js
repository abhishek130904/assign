const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const ctrl = require('../controllers/admin.controller');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUserById);
router.patch('/users/:id/toggle-active', ctrl.toggleActive);
router.patch('/users/:id/change-role', ctrl.changeRole);
router.get('/stats', ctrl.getStats);

module.exports = router;
