// jobs/automationScheduler.js
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');

/**
 * Save automation setting
 */
async function saveAutomationSetting(userId, websiteId, settings) {
  try {
    let setting = await AutomationSetting.findOne({
      userId: userId,
      websiteId: websiteId
    });

    const isActive = settings.scanFrequency && settings.scanFrequency !== 'manual';

    // ✅ Get timezone and scanTime
    const timezone = settings.timezone || 'Asia/Kolkata';
    const scanTime = settings.scanTime || '09:00';

    if (setting) {
      setting.scanFrequency = settings.scanFrequency || 'manual';
      setting.notifications = settings.notifications || {
        email: true,
        whatsapp: false,
        criticalOnly: true
      };
      setting.isActive = isActive;
      setting.updatedAt = new Date();
      
      // ✅ Save timezone and scanTime
      setting.timezone = timezone;
      setting.scanTime = scanTime;
      
      if (isActive) {
        setting.calculateNextScan();
      } else {
        setting.nextScanAt = null;
      }
      
      await setting.save();
    } else {
      const newSetting = new AutomationSetting({
        userId: userId,
        websiteId: websiteId,
        scanFrequency: settings.scanFrequency || 'manual',
        notifications: settings.notifications || {
          email: true,
          whatsapp: false,
          criticalOnly: true
        },
        isActive: isActive,
        // ✅ Add timezone and scanTime
        timezone: timezone,
        scanTime: scanTime,
        lastScanAt: null,
        nextScanAt: null
      });
      
      if (isActive) {
        newSetting.calculateNextScan();
      }
      
      await newSetting.save();
      setting = newSetting;
    }

    return setting;
  } catch (error) {
    console.error('Error saving automation setting:', error);
    throw error;
  }
}

/**
 * Get automation logs for a website
 */
async function getAutomationLogs(websiteId, limit = 50) {
  try {
    return await AutomationLog.find({ websiteId })
      .sort({ startedAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    return [];
  }
}

/**
 * Initialize all schedules
 */
function initializeAllSchedules() {
  console.log('🔄 Initializing all automation schedules...');
  
  try {
    const { initializeAutoScans } = require('./autoScan');
    initializeAutoScans();
    console.log('✅ Auto-scans initialized');
  } catch (error) {
    console.error('❌ Failed to initialize auto-scans:', error.message);
  }
  
  try {
    const { initializeAutomationMonitor } = require('./automationMonitor');
    initializeAutomationMonitor();
    console.log('✅ Automation monitor initialized');
  } catch (error) {
    console.error('❌ Failed to initialize automation monitor:', error.message);
  }
}

module.exports = {
  saveAutomationSetting,
  getAutomationLogs,
  initializeAllSchedules
};
