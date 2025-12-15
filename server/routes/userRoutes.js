const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require Admin role
router.use(verifyToken);
router.use(authorize(['Admin']));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/reset-password', userController.resetPassword);

module.exports = router;
