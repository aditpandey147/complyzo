// controllers/scanController.js
const ScanResult = require("../models/ScanResult");
const Website = require("../models/Website");
const Alert = require("../models/Alert");
const scanner = require("../utils/websiteScanner");
const { sendEmailAlert } = require("../utils/emailService");
const axios = require("axios");
const https = require("https");

// ✅ Move scanWebsite function OUTSIDE performScan
const scanWebsiteDirectly = async (url) => {
  try {
    console.log(`🌐 Fetching website: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    if (response.status !== 200) {
      throw new Error(`Website returned status: ${response.status}`);
    }

    console.log(`✅ Successfully fetched ${url} (Status: ${response.status})`);
    return response;
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${url}:`, error.message);
    throw new Error(`Failed to scan ${url}: ${error.message}`);
  }
};

// ✅ Perform scan with retry logic
const performScanWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempt ${i + 1}/${retries} for ${url}`);
      return await scanWebsiteDirectly(url);
    } catch (error) {
      console.log(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

exports.performScan = async (req, res) => {
  try {
    const { websiteId, maxPages = 10, scanDepth = 2 } = req.body;

    console.log("📊 Scan request received:", {
      websiteId,
      maxPages,
      scanDepth,
    });

    if (!websiteId) {
      return res.status(400).json({ 
        success: false,
        message: "Website ID is required" 
      });
    }

    const website = await Website.findById(websiteId);

    if (!website) {
      return res.status(404).json({ 
        success: false,
        message: "Website not found" 
      });
    }

    console.log(`🔍 Starting scan for ${website.url} - Max pages: ${maxPages}`);

    // ✅ Check if website is accessible first
    try {
      await performScanWithRetry(website.url);
      console.log(`✅ Website ${website.url} is accessible`);
    } catch (error) {
      console.error(`❌ Website ${website.url} is not accessible:`, error.message);
      return res.status(400).json({
        success: false,
        message: `Unable to scan website. The website ${website.url} is not accessible from the server. Please check if the URL is correct and the website is online.`,
        error: error.message
      });
    }

    // ✅ Perform the scan using scanner
    let scanResults;
    try {
      scanResults = await scanner.scanWebsite(website.url, {
        maxPages,
        scanDepth,
      });
    } catch (error) {
      console.error("❌ Scanner error:", error);
      return res.status(500).json({
        success: false,
        message: "Scan failed: " + error.message,
      });
    }

    // ✅ Save results
    const scanResult = new ScanResult({
      websiteId,
      seoScore: scanResults.seoScore || 0,
      securityScore: scanResults.securityScore || 0,
      complianceScore: scanResults.complianceScore || 0,
      performanceScore: scanResults.performanceScore || 0,
      issues: scanResults.issues || [],
      pagesScanned: scanResults.pagesScanned || 1,
      pageDetails: scanResults.pageDetails || [],
    });

    await scanResult.save();
    console.log(`💾 Scan results saved for ${website.url}`);
    console.log(`📋 Found ${scanResults.issues?.length || 0} issues`);

    // ✅ Create alerts for all issues
    const allIssues = scanResults.issues || [];

    for (const issue of allIssues) {
      const existingAlert = await Alert.findOne({
        userId: req.user.id,
        websiteId: websiteId,
        message: `${website.url}: ${issue.message}`,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (!existingAlert) {
        const alert = new Alert({
          userId: req.user.id,
          websiteId: websiteId,
          message: `${website.url}: ${issue.message}`,
          severity: issue.severity || "Info",
          isRead: false,
          createdAt: new Date(),
        });
        await alert.save();
        console.log(`🔔 Alert created: ${issue.severity} - ${issue.message}`);

        // Send email ONLY for Critical issues
        if (issue.severity === "Critical") {
          try {
            await sendEmailAlert(req.user.id, alert.message);
            console.log(`📧 Email sent for critical issue`);
          } catch (emailError) {
            console.error("Email send failed:", emailError);
          }
        }
      }
    }

    // ✅ Create scan completion alert
    const completionAlert = new Alert({
      userId: req.user.id,
      websiteId: websiteId,
      message: `✅ Scan completed for ${website.url}. Found ${allIssues.length} issues.`,
      severity: "Info",
      isRead: false,
      createdAt: new Date(),
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
      createdAt: scanResult.createdAt,
    });

  } catch (error) {
    console.error("❌ Scan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getScanResults = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const results = await ScanResult.find({ websiteId }).sort({
      createdAt: -1,
    });
    console.log(`📊 Retrieved ${results.length} scan results for website ${websiteId}`);
    res.json(results);
  } catch (error) {
    console.error("Get scan results error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.getLatestScan = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const result = await ScanResult.findOne({ websiteId }).sort({
      createdAt: -1,
    });
    console.log(`📊 Latest scan for website ${websiteId}: ${result ? "found" : "not found"}`);
    res.json(result || null);
  } catch (error) {
    console.error("Get latest scan error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
