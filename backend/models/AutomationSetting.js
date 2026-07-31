const mongoose = require('mongoose');

const automationSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    index: true
  },
  scanFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'manual'],
    default: 'manual'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: false
    },
    criticalOnly: {
      type: Boolean,
      default: true
    }
  },
  lastScanAt: {
    type: Date,
    default: null
  },
  nextScanAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ FIX 1: Use async/await WITHOUT next parameter
automationSettingSchema.pre('save', async function() {
  this.updatedAt = new Date();
  // No next() needed with async
});

// ✅ FIX 2: OR use regular function WITH next parameter
// automationSettingSchema.pre('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

// ✅ Calculate next scan date
automationSettingSchema.methods.calculateNextScan = function() {
  const now = new Date();
  let nextDate = new Date(now);
  
  switch(this.scanFrequency) {
    case 'daily':
      nextDate.setDate(now.getDate() + 1);
      nextDate.setHours(9, 0, 0, 0);
      break;
    case 'weekly':
      const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
      nextDate.setDate(now.getDate() + daysUntilMonday);
      nextDate.setHours(9, 0, 0, 0);
      break;
    case 'monthly':
      nextDate.setMonth(now.getMonth() + 1);
      nextDate.setDate(1);
      nextDate.setHours(9, 0, 0, 0);
      break;
    default:
      this.nextScanAt = null;
      return null;
  }
  
  this.nextScanAt = nextDate;
  return nextDate;
};

module.exports = mongoose.model('AutomationSetting', automationSettingSchema);
