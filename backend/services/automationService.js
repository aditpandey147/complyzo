// backend/services/automationService.js
const axios = require('axios');
const https = require('https');
const Website = require('../models/Website');
const ScanResult = require('../models/ScanResult');
const Alert = require('../models/Alert');
const scanner = require('../utils/websiteScanner');

const performAutomatedScan = async (setting) => {
  console.log(`🔍 Starting automated scan for: ${setting.websiteId}`);
  
  try {
    const website = await Website.findById(setting.websiteId);
    if (!website) {
      throw new Error('Website not found');
    }
    
    // Perform scan
    const scanResults = await scanner.scanWebsite(website.url, {
      maxPages: 10,
      scanDepth: 2
    });
    
    // Save results
    const scanResult = new ScanResult({
      websiteId: website._id,
      seoScore: scanResults.seoScore || 0,
      securityScore: scanResults.securityScore || 0,
      complianceScore: scanResults.complianceScore || 0,
      performanceScore: scanResults.performanceScore || 0,
      issues: scanResults.issues || [],
      pagesScanned: scanResults.pagesScanned || 1,
      pageDetails: scanResults.pageDetails || [],
    });
    
    await scanResult.save();
    console.log(`✅ Scan saved for ${website.url}`);
    
    // Create alerts for issues
    const allIssues = scanResults.issues || [];
    for (const issue of allIssues) {
      const alert = new Alert({
        userId: setting.userId,
        websiteId: website._id,
        message: `${website.url}: ${issue.message}`,
        severity: issue.severity || 'Warning',
        isRead: false,
        createdAt: new Date(),
      });
      await alert.save();
    }
    
    return scanResult;
    
  } catch (error) {
    console.error('Scan failed:', error.message);
    throw error;
  }
};

module.exports = { performAutomatedScan };