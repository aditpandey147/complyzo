// models/AutomationSetting.js
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

// ✅ FIXED: Calculate next scan based on user's timezone
automationSettingSchema.methods.calculateNextScan = function() {
  const now = new Date();
  const timezone = this.timezone || 'UTC';
  const [hours, minutes] = (this.scanTime || '09:00').split(':').map(Number);
  
  console.log(`🔍 Calculating next scan:`);
  console.log(`   Timezone: ${timezone}`);
  console.log(`   Scan time: ${hours}:${minutes}`);
  
  // ✅ Get timezone offset in minutes
  let tzOffset = 0;
  try {
    const localStr = now.toLocaleString('en-US', { timeZone: timezone });
    const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const localTime = new Date(localStr).getTime();
    const utcTime = new Date(utcStr).getTime();
    tzOffset = (localTime - utcTime) / (1000 * 60);
    console.log(`   Timezone offset: ${tzOffset} minutes (${tzOffset/60} hours)`);
  } catch (error) {
    console.log(`   ⚠️ Error getting offset for ${timezone}, using UTC`);
  }
  
  // ✅ Calculate in minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const localMinutes = utcMinutes + tzOffset;
  const targetMinutes = hours * 60 + minutes;
  
  console.log(`   Current UTC minutes: ${utcMinutes}`);
  console.log(`   Current local minutes: ${localMinutes}`);
  console.log(`   Target local minutes: ${targetMinutes}`);
  
  // ✅ Calculate days to add
  let daysToAdd = 0;
  if (localMinutes >= targetMinutes) {
    daysToAdd = 1;
    console.log(`   Target time passed today, scheduling for tomorrow`);
  }
  
  // ✅ Calculate target UTC time
  const targetUTC = new Date(now);
  targetUTC.setUTCDate(targetUTC.getUTCDate() + daysToAdd);
  targetUTC.setUTCHours(0, 0, 0, 0);
  
  // ✅ Add target minutes in local time converted to UTC
  const targetUTCMinutes = targetMinutes - tzOffset;
  targetUTC.setUTCMinutes(targetUTCMinutes);
  
  console.log(`   Next scan in UTC: ${targetUTC.toISOString()}`);
  
  this.nextScanAt = targetUTC;
  return this.nextScanAt;
};

// ❌ No pre-save hook - handle in route
module.exports = mongoose.model('AutomationSetting', automationSettingSchema);
