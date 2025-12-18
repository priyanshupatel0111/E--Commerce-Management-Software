const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
// Add middleware if authentication is needed, assuming open or global validation for now based on context
// const auth = require('../middleware/auth'); 

router.post('/', returnController.createReturn);
router.get('/', returnController.getAllReturns);
module.exports = router;
