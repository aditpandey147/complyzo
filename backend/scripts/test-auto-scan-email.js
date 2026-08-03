// scripts/test-auto-scan-email.js - Fix email handling
const mongoose = require('mongoose');
const AutomationSetting = require('../models/AutomationSetting');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendEmailAlert } = require('../utils/emailService');
require('dotenv').config();

async function testAutoScanAndEmail() {
  console.log('🚀 ===== AUTO SCAN & EMAIL TEST =====\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const userId = '6a69e0eca2618d284327d957';
    const websiteId = '6a69f22e3cff19b568462d66';
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.email}`);
    console.log('');

    // ✅ Get automation settings
    const setting = await AutomationSetting.findOne({ userId, websiteId });
    
    if (!setting) {
      console.log('❌ Automation setting not found');
      return;
    }
    
    console.log('📋 Automation Settings:');
    console.log(`   Email Enabled: ${setting.notifications?.email}`);
    console.log(`   Critical Only: ${setting.notifications?.criticalOnly}`);
    console.log('');

    // ✅ Test email directly
    console.log('📧 Testing email with ZeptoMail...');
    console.log('=' .repeat(50));
    
    // Send a test email
    const result = await sendEmailAlert(userId, '🧪 TEST: This is a test email from ComplyZo ZeptoMail integration!');
    
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Check your inbox: ${user.email}`);
    } else {
      console.log('❌ Test email failed');
    }
    
    console.log('');
    console.log('✅ Test completed!');
    
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
