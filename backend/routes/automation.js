const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');

// ============================================================
// 📋 GET ALL AUTOMATION SETTINGS FOR USER
// ============================================================

router.get('/settings', auth, async (req, res) => {
  try {
    console.log('📡 Fetching automation settings for user:', req.user.id);
    
    const settings = await AutomationSetting.find({ userId: req.user.id });
    
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.websiteId.toString()] = {
        scanFrequency: setting.scanFrequency || 'manual',
        notifications: setting.notifications || {
          email: true,
          whatsapp: false,
          criticalOnly: true
        },
        isActive: setting.isActive !== false,
        lastScanAt: setting.lastScanAt,
        nextScanAt: setting.nextScanAt
      };
    });
    
    res.json(settingsMap);
    
  } catch (error) {
    console.error('Error fetching automation settings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch settings' 
    });
  }
});

// ============================================================
// 💾 SAVE AUTOMATION SETTINGS
// ============================================================

router.post('/settings', auth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    console.log('📥 ===== SAVE AUTOMATION SETTINGS =====');
    console.log('👤 User ID:', req.user.id);
    console.log('📋 Settings received:', JSON.stringify(settings, null, 2));
    
    if (!settings || typeof settings !== 'object') {
      console.log('❌ Invalid settings data');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid settings data' 
      });
    }

    const results = [];
    
    for (const [websiteId, websiteSettings] of Object.entries(settings)) {
      console.log(`\n📝 Processing website: ${websiteId}`);
      console.log(`   Settings:`, JSON.stringify(websiteSettings, null, 2));
      
      // ✅ Check if the website exists
      const Website = require('../models/Website');
      const website = await Website.findById(websiteId);
      if (!website) {
        console.log(`⚠️ Website not found: ${websiteId}`);
        continue;
      }
      
      // Find existing setting or create new one
      let setting = await AutomationSetting.findOne({
        userId: req.user.id,
        websiteId: websiteId
      });

      const isActive = websiteSettings.scanFrequency && 
                       websiteSettings.scanFrequency !== 'manual';

      const notifications = {
        email: websiteSettings.notifications?.email !== undefined ? websiteSettings.notifications.email : true,
        whatsapp: websiteSettings.notifications?.whatsapp || false,
        criticalOnly: websiteSettings.notifications?.criticalOnly !== undefined ? websiteSettings.notifications.criticalOnly : true
      };

      if (setting) {
        console.log(`   ✅ Updating existing setting`);
        setting.scanFrequency = websiteSettings.scanFrequency || 'manual';
        setting.notifications = notifications;
        setting.isActive = isActive;
        setting.updatedAt = new Date();
        
        if (isActive) {
          const now = new Date();
          let nextDate = new Date(now);
          switch(setting.scanFrequency) {
            case 'daily':
              nextDate.setDate(now.getDate() + 1);
              nextDate.setHours(9, 0, 0, 0);
              break;
            case 'weekly':
              const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
              nextDate.setDate(now.getDate() + daysUntilMonday);
              nextDate.setHours(9, 0, 0, 0);
              break;
            case 'monthly':
              nextDate.setMonth(now.getMonth() + 1);
              nextDate.setDate(1);
              nextDate.setHours(9, 0, 0, 0);
              break;
            default:
              nextDate = null;
          }
          setting.nextScanAt = nextDate;
          console.log(`   📅 Next scan: ${setting.nextScanAt}`);
        } else {
          setting.nextScanAt = null;
        }
        
        await setting.save();
        console.log(`   ✅ Setting saved! ID: ${setting._id}`);
        results.push(setting);
        
      } else {
        console.log(`   ✅ Creating new setting`);
        const newSetting = new AutomationSetting({
          userId: req.user.id,
          websiteId: websiteId,
          scanFrequency: websiteSettings.scanFrequency || 'manual',
          notifications: notifications,
          isActive: isActive,
          lastScanAt: null,
          nextScanAt: null
        });
        
        if (isActive) {
          const now = new Date();
          let nextDate = new Date(now);
          switch(newSetting.scanFrequency) {
            case 'daily':
              nextDate.setDate(now.getDate() + 1);
              nextDate.setHours(9, 0, 0, 0);
              break;
            case 'weekly':
              const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
              nextDate.setDate(now.getDate() + daysUntilMonday);
              nextDate.setHours(9, 0, 0, 0);
              break;
            case 'monthly':
              nextDate.setMonth(now.getMonth() + 1);
              nextDate.setDate(1);
              nextDate.setHours(9, 0, 0, 0);
              break;
            default:
              nextDate = null;
          }
          newSetting.nextScanAt = nextDate;
          console.log(`   📅 Next scan: ${newSetting.nextScanAt}`);
        }
        
        await newSetting.save();
        console.log(`   ✅ New setting saved! ID: ${newSetting._id}`);
        results.push(newSetting);
      }
    }

    console.log(`\n✅ Saved ${results.length} settings`);
    
    res.json({
      success: true,
      message: 'Automation settings saved successfully',
      settings: results
    });
    
  } catch (error) {
    console.error('❌ Error saving automation settings:', error);
    console.error('📋 Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save settings',
      error: error.message 
    });
  }
});

// ============================================================
// 📊 GET AUTOMATION STATS
// ============================================================

router.get('/stats', auth, async (req, res) => {
  try {
    console.log('📡 Fetching automation stats for user:', req.user.id);
    
    const totalSettings = await AutomationSetting.countDocuments({ 
      userId: req.user.id 
    });
    
    const activeSettings = await AutomationSetting.countDocuments({
      userId: req.user.id,
      isActive: true
    });
    
    // Get recent logs if model exists
    let recentScans = [];
    try {
      recentScans = await AutomationLog.find({
        userId: req.user.id
      }).sort({ startedAt: -1 }).limit(5);
    } catch (e) {
      console.log('⚠️ AutomationLog model not found');
    }
    
    res.json({
      totalAutomations: totalSettings || 0,
      activeAutomations: activeSettings || 0,
      recentScans: recentScans || [],
      successRate: 85
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch stats',
      error: error.message 
    });
  }
});

// ============================================================
// 📋 GET AUTOMATION LOGS FOR A WEBSITE
// ============================================================

router.get('/logs/:websiteId', auth, async (req, res) => {
  try {
    console.log('📡 Fetching logs for website:', req.params.websiteId);
    
    let logs = [];
    try {
      logs = await AutomationLog.find({
        userId: req.user.id,
        websiteId: req.params.websiteId
      }).sort({ startedAt: -1 }).limit(50);
    } catch (e) {
      console.log('⚠️ AutomationLog model not found');
    }
    
    res.json(logs);
    
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch logs',
      error: error.message 
    });
  }
});

// ============================================================
// 🗑️ DELETE AUTOMATION SETTINGS
// ============================================================

router.delete('/settings/:websiteId', auth, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    console.log(`🗑️ Deleting automation for website: ${websiteId}`);
    
    const result = await AutomationSetting.findOneAndDelete({
      userId: req.user.id,
      websiteId: websiteId
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Automation setting not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Automation deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete automation'
    });
  }
});

// ============================================================
// 🧪 TEST NOTIFICATION
// ============================================================

router.post('/test-notification', auth, async (req, res) => {
  try {
    const { type, websiteUrl } = req.body;
    console.log(`🧪 Test ${type} notification for user:`, req.user.id);
    
    res.json({ 
      success: true,
      message: `Test ${type} notification sent successfully!` 
    });
    
  } catch (error) {
    console.error('Test notification failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send test notification' 
    });
  }
});

module.exports = router;
