// backend/routes/automation.js - Updated save route
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
        timezone: setting.timezone || 'UTC',
        scanTime: setting.scanTime || '09:00',
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
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid settings data' 
      });
    }

    const results = [];
    
    for (const [websiteId, websiteSettings] of Object.entries(settings)) {
      console.log(`📝 Processing website: ${websiteId}`);
      
      const Website = require('../models/Website');
      const website = await Website.findById(websiteId);
      if (!website) {
        console.log(`⚠️ Website not found: ${websiteId}`);
        continue;
      }
      
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
        setting.timezone = websiteSettings.timezone || 'UTC';
        setting.scanTime = websiteSettings.scanTime || '09:00';
        setting.updatedAt = new Date();
        
        // ✅ Manually calculate next scan
        if (isActive) {
          setting.calculateNextScan();
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
          timezone: websiteSettings.timezone || 'UTC',
          scanTime: websiteSettings.scanTime || '09:00',
          lastScanAt: null,
          nextScanAt: null
        });
        
        // ✅ Manually calculate next scan
        if (isActive) {
          newSetting.calculateNextScan();
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
    const totalSettings = await AutomationSetting.countDocuments({ 
      userId: req.user.id 
    });
    
    const activeSettings = await AutomationSetting.countDocuments({
      userId: req.user.id,
      isActive: true
    });
    
    res.json({
      totalAutomations: totalSettings || 0,
      activeAutomations: activeSettings || 0,
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
// 📋 GET AUTOMATION LOGS
// ============================================================

router.get('/logs/:websiteId', auth, async (req, res) => {
  try {
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

module.exports = router;
