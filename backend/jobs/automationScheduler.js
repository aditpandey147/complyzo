// backend/jobs/automationScheduler.js
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');

// ✅ Check if it's time to run
const shouldRunNow = (timezone, scanFrequency, scanTime) => {
  const now = new Date();
  
  try {
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const [hours, minutes] = (scanTime || '09:00').split(':').map(Number);
    
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const targetMinutes = hours * 60 + minutes;
    const diff = Math.abs(currentMinutes - targetMinutes);
    
    if (diff > 5) return false;
    
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
    
    const { performAutomatedScan } = require('../services/automationService');
    await performAutomatedScan(setting);
    
    setting.lastScanAt = new Date();
    setting.calculateNextScan(); // ✅ Manual calculation
    await setting.save();
    
    console.log(`✅ Scan completed for website: ${setting.websiteId}`);
    console.log(`📅 Next scan: ${setting.nextScanAt}`);
    
  } catch (error) {
    console.error(`❌ Scan failed for ${setting.websiteId}:`, error.message);
  }
};

// ✅ Check all schedules
const checkAllSchedules = async () => {
  try {
    const settings = await AutomationSetting.find({ 
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });
    
    if (settings.length === 0) return;
    
    console.log(`🔍 Checking ${settings.length} automation schedules...`);
    
    for (const setting of settings) {
      const timezone = setting.timezone || 'UTC';
      const scanTime = setting.scanTime || '09:00';
      const scanFrequency = setting.scanFrequency;
      
      if (shouldRunNow(timezone, scanFrequency, scanTime)) {
        console.log(`⏰ Running scan for ${setting.websiteId} at ${timezone}`);
        await processScan(setting);
      }
    }
  } catch (error) {
    console.error('❌ Check schedules error:', error);
  }
};

// ✅ Update all next scan times
const updateAllNextScanTimes = async () => {
  try {
    console.log('📋 Updating all next scan times...');
    
    const settings = await AutomationSetting.find({ 
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });
    
    console.log(`📋 Found ${settings.length} active automations`);
    
    for (const setting of settings) {
      setting.calculateNextScan(); // ✅ Manual calculation
      await setting.save();
      console.log(`📅 Next scan for ${setting.websiteId}: ${setting.nextScanAt}`);
    }
    
    console.log('✅ All next scan times updated');
  } catch (error) {
    console.error('Error updating next scan times:', error);
  }
};

// ✅ Initialize scheduler
const initializeAllSchedules = async () => {
  try {
    console.log('🔄 Initializing automation schedules...');
    
    // Run every minute
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

module.exports = { initializeAllSchedules };
