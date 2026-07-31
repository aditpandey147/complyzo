const ScanResult = require('../models/ScanResult');
const Website = require('../models/Website');
const Alert = require('../models/Alert');
const scanner = require('../utils/websiteScanner');
const { sendEmailAlert } = require('../utils/emailService');

exports.performScan = async (req, res) => {
  try {
    const { websiteId, maxPages = 10, scanDepth = 2 } = req.body;
    
    console.log('📊 Scan request received:', { websiteId, maxPages, scanDepth });
    
    if (!websiteId) {
      return res.status(400).json({ message: 'Website ID is required' });
    }
    
    const website = await Website.findById(websiteId);
    
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    console.log(`🔍 Starting scan for ${website.url} - Max pages: ${maxPages}`);

    // Perform the scan
    const scanResults = await scanner.scanWebsite(website.url, { maxPages, scanDepth });

    // Save results
    const scanResult = new ScanResult({
      websiteId,
      seoScore: scanResults.seoScore || 0,
      securityScore: scanResults.securityScore || 0,
      complianceScore: scanResults.complianceScore || 0,
      performanceScore: scanResults.performanceScore || 0,
      issues: scanResults.issues || [],
      pagesScanned: scanResults.pagesScanned || 1,
      pageDetails: scanResults.pageDetails || []
    });
    
    await scanResult.save();
    console.log(`💾 Scan results saved for ${website.url}`);
    console.log(`📋 Found ${scanResults.issues?.length || 0} issues`);

    // Create alerts for ALL issues (Critical, Warning, and Info)
    const allIssues = scanResults.issues || [];
    
    for (const issue of allIssues) {
      // Check if similar alert already exists in last 24 hours
      const existingAlert = await Alert.findOne({
        userId: req.user.id,
        websiteId: websiteId,
        message: `${website.url}: ${issue.message}`,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      if (!existingAlert) {
        const alert = new Alert({
          userId: req.user.id,
          websiteId: websiteId,
          message: `${website.url}: ${issue.message}`,
          severity: issue.severity, // Critical, Warning, or Info
          isRead: false,
          createdAt: new Date()
        });
        await alert.save();
        console.log(`🔔 Alert created: ${issue.severity} - ${issue.message}`);
        
        // Send email ONLY for Critical issues
        if (issue.severity === 'Critical') {
          try {
            await sendEmailAlert(req.user.id, alert.message);
            console.log(`📧 Email sent for critical issue`);
          } catch (emailError) {
            console.error('Email send failed:', emailError);
          }
        }
      }
    }

    // Always create a scan completion alert (Info level)
    const completionAlert = new Alert({
      userId: req.user.id,
      websiteId: websiteId,
      message: `✅ Scan completed for ${website.url}. Found ${allIssues.length} issues.`,
      severity: 'Info',
      isRead: false,
      createdAt: new Date()
    });
    await completionAlert.save();
    console.log(`🔔 Scan completion alert created`);

    res.status(201).json({
      success: true,
      message: `Scan completed successfully. Found ${allIssues.length} issues.`,
      seoScore: scanResult.seoScore,
      securityScore: scanResult.securityScore,
      complianceScore: scanResult.complianceScore,
      performanceScore: scanResult.performanceScore,
      issues: scanResult.issues,
      pagesScanned: scanResult.pagesScanned,
      pageDetails: scanResult.pageDetails,
      createdAt: scanResult.createdAt
    });
    
  } catch (error) {
    console.error('❌ Scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getScanResults = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const results = await ScanResult.find({ websiteId }).sort({ createdAt: -1 });
    console.log(`📊 Retrieved ${results.length} scan results for website ${websiteId}`);
    res.json(results);
  } catch (error) {
    console.error('Get scan results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLatestScan = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const result = await ScanResult.findOne({ websiteId }).sort({ createdAt: -1 });
    console.log(`📊 Latest scan for website ${websiteId}: ${result ? 'found' : 'not found'}`);
    res.json(result || null);
  } catch (error) {
    console.error('Get latest scan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
