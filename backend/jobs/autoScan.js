// jobs/autoScan.js
require('dotenv').config();
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');
const Website = require('../models/Website');
const scanner = require('../utils/websiteScanner');
const { sendEmailAlert } = require('../utils/emailService');

// ✅ NEW: Check if it's time to run in user's timezone
const shouldRunNow = (setting) => {
  const timezone = setting.timezone || 'UTC';
  const scanTime = setting.scanTime || '09:00';
  const [hours, minutes] = scanTime.split(':').map(Number);
  
  try {
    const localNow = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const targetMinutes = hours * 60 + minutes;
    const diff = Math.abs(currentMinutes - targetMinutes);
    
    return diff <= 5; // Run if within 5 minutes
  } catch (error) {
    console.error(`Error checking time for ${timezone}:`, error.message);
    return false;
  }
};

// ✅ UPDATED: Run all scans - checks each user's timezone
async function runAutoScans() {
  console.log('\n🔄 Running automated scans...');
  console.log(`📅 UTC Time: ${new Date().toISOString()}`);
  
  try {
    const settings = await AutomationSetting.find({
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });

    console.log(`📋 Found ${settings.length} active automations`);

    let dueCount = 0;

    for (const setting of settings) {
      if (shouldRunNow(setting)) {
        dueCount++;
        console.log(`⏰ Running scan for ${setting.websiteId} at ${setting.timezone || 'UTC'} time`);
        await runAutomatedScan(setting);
      }
    }

    if (dueCount === 0) {
      console.log('📋 No due automation settings at this time');
    }

    console.log('✅ Automated scans completed\n');

  } catch (error) {
    console.error('❌ Error in runAutoScans:', error);
  }
}

// ✅ KEEP: Run a single scan (no changes)
async function runAutomatedScan(setting) {
  console.log(`\n🔍 Running automated scan for setting: ${setting._id}`);
  console.log(`   Website ID: ${setting.websiteId}`);
  console.log(`   User ID: ${setting.userId}`);
  console.log(`   Frequency: ${setting.scanFrequency}`);
  console.log(`   Timezone: ${setting.timezone || 'UTC'}`);

  const log = new AutomationLog({
    userId: setting.userId,
    websiteId: setting.websiteId,
    scanType: 'automated',
    status: 'running',
    startedAt: new Date()
  });

  try {
    const website = await Website.findById(setting.websiteId);
    if (!website) {
      throw new Error('Website not found');
    }

    console.log(`   🌐 URL: ${website.url}`);

    const scanResults = await scanner.scanWebsite(website.url, { 
      maxPages: 10, 
      scanDepth: 2 
    });

    log.status = 'success';
    log.issuesFound = scanResults.issues?.length || 0;
    log.criticalIssues = scanResults.issues?.filter(i => i.severity === 'Critical').length || 0;
    log.completedAt = new Date();

    await log.save();
    console.log(`   ✅ Scan completed: ${scanResults.pagesScanned} pages, ${log.issuesFound} issues found`);

    // Send email if needed
    if (scanResults.issues && scanResults.issues.length > 0) {
      const criticalIssues = scanResults.issues.filter(i => i.severity === 'Critical');
      const shouldSendEmail = setting.notifications?.email !== false;
      const isCriticalOnly = setting.notifications?.criticalOnly === true;
      
      if (shouldSendEmail && (!isCriticalOnly || criticalIssues.length > 0)) {
        console.log(`   📧 Sending email notification...`);
        await sendEmailAlert(setting.userId, website.url, scanResults.issues);
        console.log(`   ✅ Email sent`);
      }
    }

    setting.lastScanAt = new Date();
    setting.calculateNextScan();
    await setting.save();

    console.log(`   ⏰ Next scan: ${setting.nextScanAt}`);

  } catch (error) {
    console.error(`   ❌ Scan failed:`, error.message);
    
    log.status = 'failed';
    log.errorMessage = error.message;
    log.completedAt = new Date();
    await log.save();
  }
}

// ✅ UPDATED: Run every minute (instead of fixed 9:00 AM)
function initializeAutoScans() {
  console.log('🔄 Initializing auto-scan scheduler...');
  
  // ✅ Run every minute
  cron.schedule('* * * * *', async () => {
    await runAutoScans();
  });

  console.log('✅ Auto-scan scheduler initialized');
  console.log('📅 Checking every minute for user timezones');
  console.log('⏰ Each user\'s scan will run at their local 9:00 AM');
  
  // Run once on startup for catch-up
  setTimeout(async () => {
    console.log('\n🔍 Running initial catch-up scan...');
    await runAutoScans();
  }, 10000);
}

module.exports = { 
  runAutoScans, 
  runAutomatedScan, 
  initializeAutoScans 
};
