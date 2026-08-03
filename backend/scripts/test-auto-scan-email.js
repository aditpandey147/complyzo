// scripts/test-auto-scan-email.js
const mongoose = require('mongoose');
const AutomationSetting = require('../models/AutomationSetting');
const ScanResult = require('../models/ScanResult');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { performScan } = require('../controllers/scanController');
const { sendEmailAlert } = require('../utils/emailService');
require('dotenv').config();

async function testAutoScanAndEmail() {
  console.log('🚀 ===== AUTO SCAN & EMAIL TEST =====\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ============================================================
    // 1. GET USER AND WEBSITE
    // ============================================================
    
    const userId = '6a69e0eca2618d284327d957';
    const websiteId = '6a69f22e3cff19b568462d66';
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.email}`);
    console.log(`🌐 Website ID: ${websiteId}`);
    console.log(`⏰ Timezone: ${user.timezone || 'Asia/Kolkata'}`);
    console.log('');

    // ============================================================
    // 2. GET AUTOMATION SETTINGS
    // ============================================================
    
    const setting = await AutomationSetting.findOne({ userId, websiteId });
    
    if (!setting) {
      console.log('❌ Automation setting not found');
      return;
    }
    
    console.log('📋 Automation Settings:');
    console.log(`   Frequency: ${setting.scanFrequency}`);
    console.log(`   Timezone: ${setting.timezone}`);
    console.log(`   Scan Time: ${setting.scanTime}`);
    console.log(`   Email Enabled: ${setting.notifications?.email}`);
    console.log(`   Critical Only: ${setting.notifications?.criticalOnly}`);
    console.log(`   Next Scan: ${setting.nextScanAt}`);
    console.log('');

    // ============================================================
    // 3. UPDATE NEXT SCAN TO RUN NOW
    // ============================================================
    
    console.log('⏰ Setting next scan to run in 30 seconds...');
    
    const scanTime = new Date(Date.now() + 30 * 1000); // 30 seconds from now
    setting.nextScanAt = scanTime;
    await setting.save();
    
    console.log(`   Next scan scheduled at: ${scanTime.toISOString()}`);
    console.log(`   IST: ${scanTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log('');

    // ============================================================
    // 4. RUN THE SCAN
    // ============================================================
    
    console.log('🔍 Running scan...');
    console.log('=' .repeat(50));
    
    const req = {
      user: { id: userId },
      body: { websiteId: websiteId }
    };
    
    let scanResult = null;
    const res = {
      status: (code) => ({
        json: (data) => {
          scanResult = data;
          console.log('📊 Scan Results:');
          console.log(`   Success: ${data.success}`);
          console.log(`   Issues Found: ${data.issues?.length || 0}`);
          console.log(`   SEO Score: ${data.seoScore}`);
          console.log(`   Security Score: ${data.securityScore}`);
          console.log(`   Compliance Score: ${data.complianceScore}`);
          console.log(`   Performance Score: ${data.performanceScore}`);
          console.log('');
          
          if (data.issues && data.issues.length > 0) {
            console.log('📋 Issues:');
            data.issues.forEach((issue, i) => {
              console.log(`   ${i+1}. [${issue.severity}] ${issue.message}`);
            });
            console.log('');
          }
        }
      })
    };
    
    await performScan(req, res);
    
    // ============================================================
    // 5. CHECK ALERTS CREATED
    // ============================================================
    
    console.log('🔔 Checking alerts...');
    console.log('=' .repeat(50));
    
    const alerts = await Alert.find({ 
      userId: userId,
      websiteId: websiteId 
    }).sort({ createdAt: -1 }).limit(10);
    
    console.log(`   Total alerts: ${alerts.length}`);
    
    if (alerts.length > 0) {
      const criticalAlerts = alerts.filter(a => a.severity === 'Critical');
      const warningAlerts = alerts.filter(a => a.severity === 'Warning');
      const infoAlerts = alerts.filter(a => a.severity === 'Info');
      
      console.log(`   Critical: ${criticalAlerts.length}`);
      console.log(`   Warning: ${warningAlerts.length}`);
      console.log(`   Info: ${infoAlerts.length}`);
      console.log('');
      
      // Show latest alerts
      console.log('📋 Latest Alerts:');
      alerts.slice(0, 5).forEach((alert, i) => {
        console.log(`   ${i+1}. [${alert.severity}] ${alert.message.substring(0, 60)}...`);
        console.log(`      Created: ${alert.createdAt.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
        console.log(`      Read: ${alert.isRead ? '✅' : '❌'}`);
        console.log('');
      });
    }
    console.log('');

    // ============================================================
    // 6. TEST EMAIL SENDING
    // ============================================================
    
    console.log('📧 Testing Email Sending...');
    console.log('=' .repeat(50));
    console.log(`   Email Enabled: ${setting.notifications?.email}`);
    console.log(`   Critical Only: ${setting.notifications?.criticalOnly}`);
    console.log('');
    
    // Check if email should be sent
    const criticalIssues = alerts.filter(a => a.severity === 'Critical');
    const warningIssues = alerts.filter(a => a.severity === 'Warning');
    
    let emailsToSend = 0;
    let emailTestResults = [];
    
    // Send emails based on settings
    if (setting.notifications?.email) {
      const criticalOnly = setting.notifications?.criticalOnly !== false;
      
      // Send for Critical issues (always)
      for (const alert of criticalIssues) {
        try {
          console.log(`📧 Sending email for Critical issue: ${alert.message.substring(0, 40)}...`);
          await sendEmailAlert(userId, alert.message);
          emailTestResults.push({ type: 'Critical', status: '✅ SENT', message: alert.message });
          emailsToSend++;
        } catch (error) {
          console.log(`❌ Failed to send Critical email: ${error.message}`);
          emailTestResults.push({ type: 'Critical', status: '❌ FAILED', message: alert.message });
        }
      }
      
      // Send for Warning issues only if criticalOnly is false
      if (!criticalOnly) {
        for (const alert of warningIssues) {
          try {
            console.log(`📧 Sending email for Warning issue: ${alert.message.substring(0, 40)}...`);
            await sendEmailAlert(userId, alert.message);
            emailTestResults.push({ type: 'Warning', status: '✅ SENT', message: alert.message });
            emailsToSend++;
          } catch (error) {
            console.log(`❌ Failed to send Warning email: ${error.message}`);
            emailTestResults.push({ type: 'Warning', status: '❌ FAILED', message: alert.message });
          }
        }
      } else {
        console.log(`📧 Warning emails skipped (Critical only mode)`);
      }
    } else {
      console.log('📧 Email notifications disabled');
    }
    
    console.log('');
    console.log('📧 Email Test Results:');
    console.log('=' .repeat(50));
    if (emailTestResults.length === 0) {
      console.log('   No emails to send');
      console.log(`   Critical Issues: ${criticalIssues.length}`);
      console.log(`   Warning Issues: ${warningIssues.length}`);
      console.log(`   Email Enabled: ${setting.notifications?.email}`);
      console.log(`   Critical Only: ${setting.notifications?.criticalOnly}`);
    } else {
      emailTestResults.forEach((result, i) => {
        console.log(`   ${i+1}. ${result.type} ${result.status}`);
      });
      console.log('');
      console.log(`   ✅ Total emails sent: ${emailsToSend}`);
      console.log(`   📧 Check your inbox at: ${user.email}`);
    }
    
    console.log('');

    // ============================================================
    // 7. SUMMARY
    // ============================================================
    
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`   ✅ Scan Completed: ${scanResult?.success ? 'Yes' : 'No'}`);
    console.log(`   📋 Issues Found: ${alerts.length}`);
    console.log(`   📧 Emails Sent: ${emailsToSend}`);
    console.log(`   👤 User Email: ${user.email}`);
    console.log(`   ⏰ Next Scan: ${setting.nextScanAt}`);
    console.log('');
    console.log('✅ Test completed! Check your email inbox for notifications.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testAutoScanAndEmail();
