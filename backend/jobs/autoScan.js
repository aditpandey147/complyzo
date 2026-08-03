require('dotenv').config();
const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');
const Website = require('../models/Website');
const scanner = require('../utils/websiteScanner');
const { sendEmailAlert } = require('../utils/emailService');

/**
 * Run all automated scans
 */
async function runAutoScans() {
  console.log('\n🔄 Running automated scans...');
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  
  try {
    // Find all active automation settings where nextScanAt is due
    const settings = await AutomationSetting.find({
      isActive: true,
      scanFrequency: { $ne: 'manual' },
      nextScanAt: { $lte: new Date() }
    });

    console.log(`📋 Found ${settings.length} due automation settings`);

    for (const setting of settings) {
      try {
        await runAutomatedScan(setting);
      } catch (error) {
        console.error(`❌ Error running scan for setting ${setting._id}:`, error);
      }
    }

    console.log('✅ Automated scans completed\n');

  } catch (error) {
    console.error('❌ Error in runAutoScans:', error);
  }
}

/**
 * Run a single automated scan
 */
async function runAutomatedScan(setting) {
  console.log(`\n🔍 Running automated scan for setting: ${setting._id}`);
  console.log(`   Website ID: ${setting.websiteId}`);
  console.log(`   User ID: ${setting.userId}`);
  console.log(`   Frequency: ${setting.scanFrequency}`);

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

    // Run the scan
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

    // Send email notification if there are issues
    if (scanResults.issues && scanResults.issues.length > 0) {
      const criticalIssues = scanResults.issues.filter(i => i.severity === 'Critical');
      
      if (!setting.notifications.criticalOnly || criticalIssues.length > 0) {
        console.log(`   📧 Sending email notification...`);
        await sendEmailAlert(
          setting.userId,
          website.url,
          scanResults.issues
        );
        console.log(`   ✅ Email sent`);
      }
    }

    // Update the setting
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

/**
 * Initialize the cron job for daily 9 AM scans
 */
function initializeAutoScans() {
  console.log('🔄 Initializing auto-scan scheduler...');
  
  // ✅ Schedule for 9:00 AM daily
  cron.schedule('0 9 * * *', async () => {
    console.log('\n⏰ Running scheduled auto-scan at 9:00 AM');
    await runAutoScans();
  });

  console.log('✅ Auto-scan scheduler initialized');
  console.log('📅 Daily scan scheduled for 9:00 AM');
  console.log('📋 Weekly scan scheduled for Monday 9:00 AM');
  console.log('📋 Monthly scan scheduled for 1st of month 9:00 AM');
  
  // Also run once on startup to catch any missed scans
  setTimeout(async () => {
    console.log('\n🔍 Running initial catch-up scan...');
    await runAutoScans();
  }, 10000); // Wait 10 seconds for server to fully start
}

module.exports = { 
  runAutoScans, 
  runAutomatedScan, 
  initializeAutoScans 
};
