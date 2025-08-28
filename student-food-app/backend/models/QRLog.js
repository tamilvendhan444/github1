const mongoose = require('mongoose');

const qrLogSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  scanAttempts: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    isSuccessful: {
      type: Boolean,
      default: false
    },
    isDuplicate: {
      type: Boolean,
      default: false
    },
    scannedBy: String, // Admin/Staff name
    notes: String
  }],
  isValid: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from creation
    }
  },
  firstScanAt: Date,
  totalScanAttempts: {
    type: Number,
    default: 0
  },
  duplicateScanAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update counters before saving
qrLogSchema.pre('save', function(next) {
  this.totalScanAttempts = this.scanAttempts.length;
  this.duplicateScanAttempts = this.scanAttempts.filter(scan => scan.isDuplicate).length;
  
  if (this.scanAttempts.length > 0 && !this.firstScanAt) {
    this.firstScanAt = this.scanAttempts[0].timestamp;
  }
  
  next();
});

module.exports = mongoose.model('QRLog', qrLogSchema);