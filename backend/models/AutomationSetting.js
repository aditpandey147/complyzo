// backend/models/AutomationSetting.js
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
  timezone: {
    type: String,
    default: 'UTC'
  },
  scanTime: {
    type: String,
    default: '09:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
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

// ✅ FIXED: Calculate next scan based on automation's timezone
automationSettingSchema.methods.calculateNextScan = function() {
  const now = new Date();
  const timezone = this.timezone || 'UTC';
  const [hours, minutes] = (this.scanTime || '09:00').split(':').map(Number);
  
  console.log(`🔍 Calculating next scan:`);
  console.log(`   Timezone: ${timezone}`);
  console.log(`   Scan time: ${hours}:${minutes}`);
  
  // ✅ Get current time components in the target timezone
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  console.log(`   Current time in ${timezone}: ${localNow.toString()}`);
  
  // ✅ Create a date object with the target time in the target timezone
  let nextDate = new Date(localNow);
  
  switch(this.scanFrequency) {
    case 'daily':
      nextDate.setHours(hours, minutes, 0, 0);
      if (nextDate <= localNow) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    case 'weekly':
      const daysUntilMonday = (1 - localNow.getDay() + 7) % 7 || 7;
      nextDate.setDate(localNow.getDate() + daysUntilMonday);
      nextDate.setHours(hours, minutes, 0, 0);
      break;
    case 'monthly':
      nextDate.setMonth(localNow.getMonth() + 1);
      nextDate.setDate(1);
      nextDate.setHours(hours, minutes, 0, 0);
      break;
    default:
      this.nextScanAt = null;
      return null;
  }
  
  // ✅ Convert to UTC properly by getting the UTC timestamp
  // The date object is already in local timezone, we need to convert it to UTC
  const utcDate = new Date(nextDate.getTime() - (nextDate.getTimezoneOffset() * 60000));
  
  console.log(`   Next scan in ${timezone}: ${nextDate.toString()}`);
  console.log(`   Next scan in UTC: ${utcDate.toISOString()}`);
  
  this.nextScanAt = utcDate;
  return this.nextScanAt;
};

module.exports = mongoose.model('AutomationSetting', automationSettingSchema);
