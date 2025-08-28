const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { protectStudent, protectAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Student = require('../models/Student');
const QRLog = require('../models/QRLog');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Student)
router.post('/', protectStudent, async (req, res) => {
  try {
    const { items, specialInstructions, paymentMethod = 'upi' } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate and calculate order details
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item with ID ${item.menuItemId} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently not available`
        });
      }

      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal
      });

      // Update menu item order count
      menuItem.orderCount += item.quantity;
      await menuItem.save();
    }

    // Create order
    const order = await Order.create({
      student: req.student.id,
      items: orderItems,
      totalAmount,
      specialInstructions,
      paymentMethod,
      paymentStatus: 'pending',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    // Populate order details
    await order.populate([
      { path: 'student', select: 'name rollNo email phone' },
      { path: 'items.menuItem', select: 'name category preparationTime' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/orders/:id/payment
// @desc    Process payment and generate QR code
// @access  Private (Student)
router.post('/:id/payment', protectStudent, async (req, res) => {
  try {
    const { paymentId, paymentStatus = 'completed' } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.student.toString() !== req.student.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order'
      });
    }

    // Update payment status
    order.paymentStatus = paymentStatus;
    order.paymentId = paymentId;
    order.status = 'confirmed';

    // Generate unique QR code
    const qrCodeData = uuidv4();
    order.qrCode = {
      code: qrCodeData,
      isUsed: false
    };

    await order.save();

    // Generate QR code image
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    // Create QR log entry
    await QRLog.create({
      orderId: order._id,
      qrCode: qrCodeData
    });

    // Update student statistics
    const student = await Student.findById(req.student.id);
    student.totalOrders += 1;
    student.totalSpent += order.totalAmount;
    await student.save();

    // Populate order details for response
    await order.populate([
      { path: 'student', select: 'name rollNo email phone' },
      { path: 'items.menuItem', select: 'name category' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        qrCode: qrCodeUrl,
        receipt: {
          orderNumber: order.orderNumber,
          studentName: order.student.name,
          rollNo: order.student.rollNo,
          items: order.items,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          timestamp: order.createdAt,
          qrCode: qrCodeUrl
        }
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
});

// @route   GET /api/orders/student
// @desc    Get student's orders
// @access  Private (Student)
router.get('/student', protectStudent, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { student: req.student.id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name category image')
      .sort({ createdAt: -1 })
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

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Student/Admin)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name rollNo email phone')
      .populate('items.menuItem', 'name category image preparationTime');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization check (students can only see their own orders)
    if (req.student && order.student._id.toString() !== req.student.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// @route   POST /api/orders/:id/review
// @desc    Add review to order
// @access  Private (Student)
router.post('/:id/review', protectStudent, async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.student.toString() !== req.student.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this order'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders'
      });
    }

    order.rating = rating;
    order.review = review;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Add order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
});

module.exports = router;