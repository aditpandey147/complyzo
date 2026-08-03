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

    if (setting) {
      setting.scanFrequency = settings.scanFrequency || 'manual';
      setting.notifications = settings.notifications || {
        email: true,
        whatsapp: false,
        criticalOnly: true
      };
      setting.isActive = isActive;
      setting.updatedAt = new Date();
      
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
 * ✅ This is the function that needs to be exported
 */
function initializeAllSchedules() {
  console.log('🔄 Initializing all automation schedules...');
  
  try {
    // ✅ Import and initialize auto scans
    const { initializeAutoScans } = require('./autoScan');
    initializeAutoScans();
    console.log('✅ Auto-scans initialized');
  } catch (error) {
    console.error('❌ Failed to initialize auto-scans:', error.message);
  }
  
  try {
    // ✅ Import and initialize automation monitor
    const { initializeAutomationMonitor } = require('./automationMonitor');
    initializeAutomationMonitor();
    console.log('✅ Automation monitor initialized');
  } catch (error) {
    console.error('❌ Failed to initialize automation monitor:', error.message);
  }
}

// ✅ Export all functions
module.exports = {
  saveAutomationSetting,
  getAutomationLogs,
  initializeAllSchedules
};
