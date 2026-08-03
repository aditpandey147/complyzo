// models/AutomationSetting.js - Without pre-save hook
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
    default: 'Asia/Kolkata'
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

// ✅ Calculate next scan based on user's timezone
automationSettingSchema.methods.calculateNextScan = function() {
  const now = new Date();
  const timezone = this.timezone || 'Asia/Kolkata';
  const [hours, minutes] = (this.scanTime || '09:00').split(':').map(Number);
  
  // Get timezone offset
  let tzOffset = 0;
  try {
    const localStr = now.toLocaleString('en-US', { timeZone: timezone });
    const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const localTime = new Date(localStr).getTime();
    const utcTime = new Date(utcStr).getTime();
    tzOffset = (localTime - utcTime) / (1000 * 60);
  } catch (error) {
    console.log(`⚠️ Error getting offset for ${timezone}, using UTC`);
  }
  
  // Calculate in minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const localMinutes = utcMinutes + tzOffset;
  const targetMinutes = hours * 60 + minutes;
  
  // Calculate days to add
  let daysToAdd = 0;
  
  if (this.scanFrequency === 'daily') {
    if (localMinutes >= targetMinutes) {
      daysToAdd = 1;
    }
  }
  
  if (this.scanFrequency === 'weekly') {
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const daysUntilMonday = (1 - localNow.getDay() + 7) % 7 || 7;
    daysToAdd = daysUntilMonday;
    if (localNow.getDay() === 1 && localMinutes >= targetMinutes) {
      daysToAdd = 7;
    }
  }
  
  if (this.scanFrequency === 'monthly') {
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentDay = localNow.getDate();
    const daysInMonth = new Date(localNow.getFullYear(), localNow.getMonth() + 1, 0).getDate();
    if (currentDay >= 1) {
      daysToAdd = (daysInMonth - currentDay) + 1;
    } else {
      daysToAdd = 0;
    }
  }
  
  const targetUTC = new Date(now);
  targetUTC.setUTCDate(targetUTC.getUTCDate() + daysToAdd);
  targetUTC.setUTCHours(0, 0, 0, 0);
  
  const targetUTCMinutes = targetMinutes - tzOffset;
  targetUTC.setUTCMinutes(targetUTCMinutes);
  
  this.nextScanAt = targetUTC;
  return this.nextScanAt;
};

// ❌ NO pre-save hook - removed

module.exports = mongoose.model('AutomationSetting', automationSettingSchema);
