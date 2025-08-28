const express = require('express');
const { protectAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const QRLog = require('../models/QRLog');

const router = express.Router();

// @route   POST /api/qr/scan
// @desc    Scan QR code and validate
// @access  Private (Admin)
router.post('/scan', protectAdmin, async (req, res) => {
  try {
    const { qrCode, scannedBy } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    // Find the order with this QR code
    const order = await Order.findOne({ 'qrCode.code': qrCode })
      .populate('student', 'name rollNo email phone')
      .populate('items.menuItem', 'name category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code - Order not found'
      });
    }

    // Find QR log entry
    const qrLog = await QRLog.findOne({ qrCode });

    if (!qrLog) {
      return res.status(404).json({
        success: false,
        message: 'QR code log not found'
      });
    }

    // Check if QR code has expired
    if (new Date() > qrLog.validUntil) {
      // Log the scan attempt
      qrLog.scanAttempts.push({
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isSuccessful: false,
        isDuplicate: false,
        scannedBy,
        notes: 'QR code expired'
      });
      await qrLog.save();

      return res.status(400).json({
        success: false,
        message: 'QR code has expired',
        data: {
          orderNumber: order.orderNumber,
          expiredAt: qrLog.validUntil
        }
      });
    }

    // Check if QR code has already been used
    if (order.qrCode.isUsed) {
      // Log the duplicate scan attempt
      qrLog.scanAttempts.push({
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isSuccessful: false,
        isDuplicate: true,
        scannedBy,
        notes: 'Duplicate scan attempt'
      });
      await qrLog.save();

      return res.status(400).json({
        success: false,
        message: 'Duplicate Receipt - This QR code has already been used',
        data: {
          orderNumber: order.orderNumber,
          originalScanTime: order.qrCode.usedAt,
          studentName: order.student.name,
          rollNo: order.student.rollNo,
          totalAmount: order.totalAmount,
          isDuplicate: true
        }
      });
    }

    // Check if payment is completed
    if (order.paymentStatus !== 'completed') {
      qrLog.scanAttempts.push({
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isSuccessful: false,
        isDuplicate: false,
        scannedBy,
        notes: 'Payment not completed'
      });
      await qrLog.save();

      return res.status(400).json({
        success: false,
        message: 'Payment not completed for this order'
      });
    }

    // Valid QR code - mark as used
    order.qrCode.isUsed = true;
    order.qrCode.usedAt = new Date();
    order.qrCode.scannedBy = scannedBy;
    
    // Update order status to delivered if not already
    if (order.status !== 'delivered') {
      order.status = 'delivered';
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Log successful scan
    qrLog.scanAttempts.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isSuccessful: true,
      isDuplicate: false,
      scannedBy,
      notes: 'Successful scan and delivery'
    });
    qrLog.isValid = false; // Mark QR as no longer valid
    await qrLog.save();

    res.status(200).json({
      success: true,
      message: 'QR code scanned successfully - Order delivered',
      data: {
        order: {
          orderNumber: order.orderNumber,
          studentName: order.student.name,
          rollNo: order.student.rollNo,
          email: order.student.email,
          phone: order.student.phone,
          items: order.items,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          specialInstructions: order.specialInstructions,
          orderTime: order.createdAt,
          deliveryTime: order.actualDeliveryTime,
          scannedBy,
          scannedAt: order.qrCode.usedAt
        },
        isFirstScan: true
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scanning QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/qr/logs
// @desc    Get QR scan logs
// @access  Private (Admin)
router.get('/logs', protectAdmin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      isDuplicate, 
      isSuccessful, 
      limit = 50, 
      page = 1 
    } = req.query;

    let matchStage = {};

    // Date range filter
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'order.student',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$scanAttempts'
      },
      {
        $match: {
          ...(isDuplicate !== undefined && { 'scanAttempts.isDuplicate': isDuplicate === 'true' }),
          ...(isSuccessful !== undefined && { 'scanAttempts.isSuccessful': isSuccessful === 'true' })
        }
      },
      {
        $sort: { 'scanAttempts.timestamp': -1 }
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          qrCode: 1,
          orderId: 1,
          orderNumber: { $arrayElemAt: ['$order.orderNumber', 0] },
          studentName: { $arrayElemAt: ['$student.name', 0] },
          studentRollNo: { $arrayElemAt: ['$student.rollNo', 0] },
          totalAmount: { $arrayElemAt: ['$order.totalAmount', 0] },
          scanAttempt: '$scanAttempts',
          createdAt: 1
        }
      }
    ];

    const logs = await QRLog.aggregate(pipeline);

    // Get total count for pagination
    const totalCount = await QRLog.aggregate([
      { $match: matchStage },
      { $unwind: '$scanAttempts' },
      {
        $match: {
          ...(isDuplicate !== undefined && { 'scanAttempts.isDuplicate': isDuplicate === 'true' }),
          ...(isSuccessful !== undefined && { 'scanAttempts.isSuccessful': isSuccessful === 'true' })
        }
      },
      { $count: 'total' }
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { logs }
    });
  } catch (error) {
    console.error('Get QR logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR logs'
    });
  }
});

// @route   GET /api/qr/stats
// @desc    Get QR scanning statistics
// @access  Private (Admin)
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await QRLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalQRCodes: { $sum: 1 },
          totalScanAttempts: { $sum: '$totalScanAttempts' },
          duplicateScanAttempts: { $sum: '$duplicateScanAttempts' },
          successfulScans: {
            $sum: {
              $size: {
                $filter: {
                  input: '$scanAttempts',
                  cond: { $eq: ['$$this.isSuccessful', true] }
                }
              }
            }
          },
          expiredQRCodes: {
            $sum: {
              $cond: [
                { $lt: ['$validUntil', new Date()] },
                1,
                0
              ]
            }
          },
          validQRCodes: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isValid', true] },
                  { $gt: ['$validUntil', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalQRCodes: 0,
      totalScanAttempts: 0,
      duplicateScanAttempts: 0,
      successfulScans: 0,
      expiredQRCodes: 0,
      validQRCodes: 0
    };

    // Calculate success rate
    result.successRate = result.totalScanAttempts > 0 
      ? ((result.successfulScans / result.totalScanAttempts) * 100).toFixed(2)
      : 0;

    // Calculate duplicate rate
    result.duplicateRate = result.totalScanAttempts > 0
      ? ((result.duplicateScanAttempts / result.totalScanAttempts) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get QR stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR statistics'
    });
  }
});

module.exports = router;