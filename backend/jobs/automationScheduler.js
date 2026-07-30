// backend/jobs/automationScheduler.js
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');

// ✅ Check if it's time to run for a specific automation
const shouldRunNow = (timezone, scanFrequency, scanTime) => {
  const now = new Date();
  
  try {
    // ✅ Get current time in the automation's timezone
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const [hours, minutes] = (scanTime || '09:00').split(':').map(Number);
    
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const targetMinutes = hours * 60 + minutes;
    const diff = Math.abs(currentMinutes - targetMinutes);
    
    // Run if within 5 minutes of target time
    if (diff > 5) return false;
    
    // Check frequency
    if (scanFrequency === 'daily') return true;
    if (scanFrequency === 'weekly') return localNow.getDay() === 1;
    if (scanFrequency === 'monthly') return localNow.getDate() === 1;
    
    return false;
  } catch (error) {
    console.error('Error checking time:', error);
    return false;
  }
};

// ✅ Process a single scan
const processScan = async (setting) => {
  try {
    console.log(`🔍 Running scan for website: ${setting.websiteId}`);
    
    // Import scan service
    const { performAutomatedScan } = require('../services/automationService');
    
    // Perform the scan
    await performAutomatedScan(setting);
    
    // Update last scan time
    setting.lastScanAt = new Date();
    
    // Calculate next scan
    setting.calculateNextScan();
    
    // Save
    await setting.save();
    
    console.log(`✅ Scan completed for website: ${setting.websiteId}`);
    console.log(`📅 Next scan at: ${setting.nextScanAt}`);
    
  } catch (error) {
    console.error(`❌ Scan failed for ${setting.websiteId}:`, error.message);
  }
};

// ✅ Check all automation schedules
const checkAllSchedules = async () => {
  try {
    // ✅ Get all active automations from database
    const settings = await AutomationSetting.find({ 
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });
    
    if (settings.length === 0) {
      return;
    }
    
    console.log(`🔍 Checking ${settings.length} automation schedules...`);
    
    for (const setting of settings) {
      // ✅ Read timezone from database
      const timezone = setting.timezone || 'UTC';
      const scanTime = setting.scanTime || '09:00';
      const scanFrequency = setting.scanFrequency;
      
      // ✅ Check if it's time to run
      if (shouldRunNow(timezone, scanFrequency, scanTime)) {
        console.log(`⏰ Running scan for ${setting.websiteId} at ${timezone} time`);
        await processScan(setting);
      }
    }
    
  } catch (error) {
    console.error('❌ Check schedules error:', error);
  }
};

// ✅ Initialize scheduler
const initializeAllSchedules = async () => {
  try {
    console.log('🔄 Initializing automation schedules...');
    
    // Run every minute to check schedules
    cron.schedule('* * * * *', async () => {
      await checkAllSchedules();
    });
    
    console.log('✅ Schedules initialized');
    
    // Update all next scan times on startup
    await updateAllNextScanTimes();
    
  } catch (error) {
    console.error('❌ Schedule initialization error:', error);
  }
};

// ✅ Update all next scan times
const updateAllNextScanTimes = async () => {
  try {
    const settings = await AutomationSetting.find({ 
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });
    
    for (const setting of settings) {
      setting.calculateNextScan();
      await setting.save();
      console.log(`📅 Next scan for ${setting.websiteId}: ${setting.nextScanAt}`);
    }
  } catch (error) {
    console.error('Error updating next scan times:', error);
  }
};

module.exports = { initializeAllSchedules };
