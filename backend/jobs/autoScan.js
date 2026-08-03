// jobs/autoScan.js
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');

// ✅ Check if it's time to run based on user's timezone
const shouldRunNow = (timezone, scanFrequency, scanTime) => {
  const now = new Date();
  
  try {
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const [hours, minutes] = (scanTime || '09:00').split(':').map(Number);
    
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const targetMinutes = hours * 60 + minutes;
    const diff = Math.abs(currentMinutes - targetMinutes);
    
    // Run if within 5 minutes of target time
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

// ✅ Initialize auto scans
const initializeAutoScans = () => {
  console.log('🔄 Initializing auto scans with timezone support...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const settings = await AutomationSetting.find({ 
        isActive: true,
        scanFrequency: { $ne: 'manual' }
      });
      
      for (const setting of settings) {
        const timezone = setting.timezone || 'Asia/Kolkata';
        const scanTime = setting.scanTime || '09:00';
        const scanFrequency = setting.scanFrequency;
        
        if (shouldRunNow(timezone, scanFrequency, scanTime)) {
          console.log(`⏰ Running scan for ${setting.websiteId} at ${timezone} (${scanTime})`);
          
          try {
            const { performAutomatedScan } = require('../services/automationService');
            await performAutomatedScan(setting);
            
            setting.lastScanAt = new Date();
            setting.calculateNextScan();
            await setting.save();
            
            console.log(`✅ Scan completed for ${setting.websiteId}`);
            console.log(`📅 Next scan: ${setting.nextScanAt}`);
          } catch (error) {
            console.error(`❌ Scan failed for ${setting.websiteId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Auto scan error:', error);
    }
  });
  
  console.log('✅ Auto scans initialized');
};

module.exports = { initializeAutoScans };
