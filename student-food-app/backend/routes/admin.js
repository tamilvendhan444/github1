const express = require('express');
const { protectAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const Student = require('../models/Student');
const MenuItem = require('../models/MenuItem');
const QRLog = require('../models/QRLog');
const Admin = require('../models/Admin');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get basic statistics
    const [
      totalStudents,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalMenuItems,
      activeMenuItems
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Order.countDocuments(dateFilter),
      Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ ...dateFilter, status: 'pending' }),
      Order.countDocuments({ ...dateFilter, status: 'delivered' }),
      Order.countDocuments({ ...dateFilter, status: 'cancelled' }),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true })
    ]);

    // Get recent orders
    const recentOrders = await Order.find(dateFilter)
      .populate('student', 'name rollNo')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get top selling items
    const topSellingItems = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          itemName: { $first: '$items.name' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Get daily sales for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get student statistics
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalSpent' },
          totalOrders: { $sum: '$totalOrders' },
          averageSpent: { $avg: '$totalSpent' },
          averageOrders: { $avg: '$totalOrders' }
        }
      }
    ]);

    const stats = {
      overview: {
        totalStudents,
        totalOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        averageOrderValue: totalOrders > 0 
          ? ((totalRevenue.length > 0 ? totalRevenue[0].total : 0) / totalOrders).toFixed(2)
          : 0
      },
      orders: {
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        completionRate: totalOrders > 0 
          ? ((deliveredOrders / totalOrders) * 100).toFixed(2)
          : 0
      },
      menu: {
        totalItems: totalMenuItems,
        activeItems: activeMenuItems,
        inactiveItems: totalMenuItems - activeMenuItems
      },
      students: studentStats.length > 0 ? {
        averageSpent: studentStats[0].averageSpent?.toFixed(2) || 0,
        averageOrders: studentStats[0].averageOrders?.toFixed(2) || 0
      } : { averageSpent: 0, averageOrders: 0 },
      recentOrders,
      topSellingItems,
      dailySales
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private (Admin)
router.get('/orders', protectAdmin, async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus, 
      startDate, 
      endDate, 
      search,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNo: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { student: { $in: students.map(s => s._id) } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('student', 'name rollNo email phone')
      .populate('items.menuItem', 'name category image')
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
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', protectAdmin, async (req, res) => {
  try {
    const { 
      search, 
      isVerified, 
      isActive, 
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Filter by verification status
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const students = await Student.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalStudents = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      totalStudents,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalStudents / parseInt(limit)),
      data: { students }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// @route   PUT /api/admin/students/:id/verify
// @desc    Verify/unverify student
// @access  Private (Admin)
router.put('/students/:id/verify', protectAdmin, async (req, res) => {
  try {
    const { isVerified } = req.body;

    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.isVerified = isVerified;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { student: { id: student._id, name: student.name, isVerified: student.isVerified } }
    });
  } catch (error) {
    console.error('Verify student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student verification status'
    });
  }
});

// @route   PUT /api/admin/students/:id/status
// @desc    Activate/deactivate student
// @access  Private (Admin)
router.put('/students/:id/status', protectAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.isActive = isActive;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { student: { id: student._id, name: student.name, isActive: student.isActive } }
    });
  } catch (error) {
    console.error('Update student status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student status'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', protectAdmin, async (req, res) => {
  try {
    const { startDate, endDate, type = 'sales' } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let analytics = {};

    if (type === 'sales' || type === 'all') {
      // Sales analytics
      const salesData = await Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: { $hour: '$createdAt' }
            },
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ]);

      analytics.sales = salesData;
    }

    if (type === 'menu' || type === 'all') {
      // Menu item performance
      const menuAnalytics = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.menuItem',
            itemName: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' },
            averagePrice: { $avg: '$items.price' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'menuitems',
            localField: '_id',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        {
          $addFields: {
            category: { $arrayElemAt: ['$menuItem.category', 0] },
            isVeg: { $arrayElemAt: ['$menuItem.isVeg', 0] }
          }
        },
        { $sort: { totalQuantity: -1 } }
      ]);

      analytics.menu = menuAnalytics;
    }

    if (type === 'students' || type === 'all') {
      // Student analytics
      const studentAnalytics = await Student.aggregate([
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            verifiedStudents: { $sum: { $cond: ['$isVerified', 1, 0] } },
            activeStudents: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalSpent: { $sum: '$totalSpent' },
            totalOrders: { $sum: '$totalOrders' },
            averageSpentPerStudent: { $avg: '$totalSpent' },
            averageOrdersPerStudent: { $avg: '$totalOrders' }
          }
        }
      ]);

      analytics.students = studentAnalytics.length > 0 ? studentAnalytics[0] : {};
    }

    res.status(200).json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

module.exports = router;