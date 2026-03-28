const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { verifyToken, authorize } = require('../middleware/auth'); 

router.post('/', [verifyToken, authorize(['Admin', 'TENANT_ADMIN', 'Employee'])], returnController.createReturn);
router.get('/', [verifyToken, authorize(['Admin', 'TENANT_ADMIN', 'Employee', 'Watcher'])], returnController.getAllReturns);
module.exports = router;
