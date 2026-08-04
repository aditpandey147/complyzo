// jobs/autoScan.js
require('dotenv').config();
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');
const Website = require('../models/Website');
const scanner = require('../utils/websiteScanner');
const { sendEmailAlert } = require('../utils/emailService');

// ✅ FIXED: Check if it's time to run (prevents repeated runs)
const shouldRunNow = (setting) => {
  const now = new Date();
  const nextScanAt = setting.nextScanAt;
  
  if (!nextScanAt) return false;
  
  const nextScanTime = new Date(nextScanAt);
  const timeDiff = (now - nextScanTime) / 1000; // Difference in seconds
  
  // ✅ Run if nextScanAt is within the last 5 minutes (0-300 seconds)
  if (timeDiff >= 0 && timeDiff <= 300) {
    // ✅ Check if already ran today
    if (setting.lastScanAt) {
      const lastScan = new Date(setting.lastScanAt);
      const lastScanDate = lastScan.toDateString();
      const todayDate = now.toDateString();
      
      // ✅ If already ran today, skip
      if (lastScanDate === todayDate) {
        console.log(`   ⏭️ Already ran today, skipping`);
        return false;
      }
    }
    
    console.log(`   ✅ Scan is due! (${nextScanAt})`);
    return true;
  }
  
  return false;
};

// ✅ UPDATED: Run all scans
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

    // ✅ Update lastScanAt and recalculate next scan
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

// ✅ Initialize auto-scan scheduler
function initializeAutoScans() {
  console.log('🔄 Initializing auto-scan scheduler...');
  
  // ✅ Run every minute
  cron.schedule('* * * * *', async () => {
    await runAutoScans();
  });

  console.log('✅ Auto-scan scheduler initialized');
  console.log('📅 Checking every minute for due scans');
  console.log('⏰ Scans run when nextScanAt is due (within 5-minute window)');
  
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
