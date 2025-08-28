const express = require('express');
const { protectStudent } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const Student = require('../models/Student');
const Order = require('../models/Order');

const router = express.Router();

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Private (Student)
router.put('/profile', protectStudent, upload.single('idCard'), handleUploadError, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update allowed fields
    if (name) student.name = name;
    if (phone) student.phone = phone;
    
    // Update ID card if new file uploaded
    if (req.file) {
      student.idCard = req.file.path.replace(/\\/g, '/');
      student.isVerified = false; // Reset verification status
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          phone: student.phone,
          isVerified: student.isVerified,
          totalOrders: student.totalOrders,
          totalSpent: student.totalSpent
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   GET /api/students/orders
// @desc    Get student's order history
// @access  Private (Student)
router.get('/orders', protectStudent, async (req, res) => {
  try {
    const { status, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { student: req.student.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name category image price')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      data: { orders }
    });
  } catch (error) {
    console.error('Get student orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/students/stats
// @desc    Get student's statistics
// @access  Private (Student)
router.get('/stats', protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get favorite items
    const favoriteItems = await Order.aggregate([
      { $match: { student: student._id, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          itemName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Get monthly spending
    const monthlySpending = await Order.aggregate([
      {
        $match: {
          student: student._id,
          paymentStatus: 'completed',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } // Current year
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      profile: {
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        isVerified: student.isVerified,
        memberSince: student.createdAt
      },
      orders: orderStats.length > 0 ? orderStats[0] : {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      },
      favoriteItems,
      monthlySpending
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// @route   GET /api/students/order/:id/receipt
// @desc    Get order receipt with QR code
// @access  Private (Student)
router.get('/order/:id/receipt', protectStudent, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name rollNo email phone')
      .populate('items.menuItem', 'name category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.student._id.toString() !== req.student.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this receipt'
      });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Receipt not available - payment not completed'
      });
    }

    // Generate QR code if not already generated
    let qrCodeUrl = null;
    if (order.qrCode && order.qrCode.code) {
      const QRCode = require('qrcode');
      qrCodeUrl = await QRCode.toDataURL(order.qrCode.code);
    }

    const receipt = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      student: {
        name: order.student.name,
        rollNo: order.student.rollNo,
        email: order.student.email,
        phone: order.student.phone
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      status: order.status,
      specialInstructions: order.specialInstructions,
      qrCode: qrCodeUrl,
      isQRUsed: order.qrCode ? order.qrCode.isUsed : false,
      qrUsedAt: order.qrCode ? order.qrCode.usedAt : null
    };

    res.status(200).json({
      success: true,
      data: { receipt }
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt'
    });
  }
});

module.exports = router;