const ReturnAnalysis = require('../models/ReturnAnalysis');
const Order = require('../models/Order');
const Return = require('../models/Return');

exports.createReturnAnalysis = async (req, res) => {
    try {
        const {
            order_id,
            packaging_loss,
            shipping_loss,
            product_loss,
            is_compensated,
            compensation_amount,
            total_loss,
            net_loss,
            replacement_shipping_loss,
            claim_status
        } = req.body;

        const newAnalysis = await ReturnAnalysis.create({
            order_id,
            packaging_loss,
            shipping_loss,
            product_loss,
            is_compensated,
            compensation_amount,
            total_loss,
            net_loss,
            replacement_shipping_loss,
            claim_status
        });

        res.status(201).json({ message: 'Return Analysis saved successfully', data: newAnalysis });
    } catch (error) {
        console.error('Error saving return analysis:', error);
        res.status(500).json({ message: 'Error saving return analysis', error: error.message });
    }
};

exports.getAllReturnAnalyses = async (req, res) => {
    try {
        const analyses = await ReturnAnalysis.findAll({
            order: [['createdAt', 'DESC']],
            raw: true // Get plain objects to allow attachment
        });

        // Manual fetch to avoid bad associations
        const orderIds = analyses.map(a => a.order_id);
        const returns = await Return.findAll({
            where: { order_id: orderIds },
            attributes: ['order_id', 'seller_id', 'platform'],
            raw: true
        });

        // Map Returns by order_id
        const returnsMap = {};
        returns.forEach(r => {
            returnsMap[r.order_id] = r;
        });

        // Attach Return data
        const enrichedAnalyses = analyses.map(analysis => ({
            ...analysis,
            Return: returnsMap[analysis.order_id] || {}
        }));

        res.status(200).json(enrichedAnalyses);
    } catch (error) {
        console.error('Error fetching return analyses:', error);
        res.status(500).json({ message: 'Error fetching return analyses', error: error.message });
    }
};

exports.updateReturnAnalysisStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { claim_status } = req.body;

        const analysis = await ReturnAnalysis.findByPk(id);
        if (!analysis) {
            return res.status(404).json({ message: 'Return Analysis not found' });
        }

        if (claim_status === 'Rejected') {
            analysis.compensation_amount = 0;
            // Recalculate Net Loss: Net Loss = Total Loss - Compensation (0) => Total Loss
            analysis.net_loss = analysis.total_loss;
        }

        analysis.claim_status = claim_status;
        await analysis.save();

        res.status(200).json({ message: 'Status updated successfully', data: analysis });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
