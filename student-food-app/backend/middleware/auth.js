const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Protect routes - Student authentication
const protectStudent = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const student = await Student.findById(decoded.id).select('-password');
      
      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Student not found'
        });
      }

      if (!student.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      req.student = student;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Protect routes - Admin authentication
const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account has been deactivated'
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Generate JWT Token
const generateToken = (id, userType = 'student') => {
  return jwt.sign(
    { id, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = {
  protectStudent,
  protectAdmin,
  generateToken
};