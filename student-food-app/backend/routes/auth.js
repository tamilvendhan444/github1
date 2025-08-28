const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, protectStudent, protectAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const router = express.Router();

// @route   POST /api/auth/student/register
// @desc    Register a new student
// @access  Public
router.post('/student/register', upload.single('idCard'), handleUploadError, async (req, res) => {
  try {
    const { name, rollNo, email, password, phone } = req.body;

    // Validation
    if (!name || !rollNo || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ID card image is required'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { rollNo }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or roll number already exists'
      });
    }

    // Create student
    const student = await Student.create({
      name,
      rollNo: rollNo.toUpperCase(),
      email: email.toLowerCase(),
      password,
      phone,
      idCard: req.file.path.replace(/\\/g, '/') // Normalize path for cross-platform compatibility
    });

    // Generate token
    const token = generateToken(student._id, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          phone: student.phone,
          isVerified: student.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/student/login
// @desc    Login student
// @access  Public
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find student and include password for comparison
    const student = await Student.findOne({ email: email.toLowerCase() }).select('+password');

    if (!student || !(await student.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!student.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(student._id, 'student');

    res.status(200).json({
      success: true,
      message: 'Login successful',
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
        },
        token
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/student/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/student/profile', protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    
    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          phone: student.phone,
          isVerified: student.isVerified,
          totalOrders: student.totalOrders,
          totalSpent: student.totalSpent,
          createdAt: student.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   GET /api/auth/admin/profile
// @desc    Get admin profile
// @access  Private (Admin)
router.get('/admin/profile', protectAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

module.exports = router;