const express = require('express');
const router = express.Router();
const returnAnalysisController = require('../controllers/returnAnalysis.controller');
const { verifyToken } = require('../middleware/auth'); // Assuming auth middleware is here

router.post('/', verifyToken, returnAnalysisController.createReturnAnalysis);
router.get('/', verifyToken, returnAnalysisController.getAllReturnAnalyses);
router.put('/:id/status', verifyToken, returnAnalysisController.updateReturnAnalysisStatus);

module.exports = router;
