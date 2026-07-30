// controllers/competitorController.js
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const Website = require('../models/Website');
const ScanResult = require('../models/ScanResult');

// ✅ Axios instance for scanning
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true
  }),
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// ✅ Retry logic
const retryRequest = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`⚠️ Attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// ✅ Analyze a single website
const analyzeWebsite = async (url) => {
  console.log(`🔍 Analyzing: ${url}`);
  
  try {
    const response = await retryRequest(async () => {
      return await axiosInstance.get(url);
    });

    if (response.status !== 200) {
      throw new Error(`Website returned status: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    
    // Extract data
    const title = $('title').text() || 'No title';
    const metaDescription = $('meta[name="description"]').attr('content') || 'No description';
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const imageCount = $('img').length;
    const imagesWithAlt = $('img[alt]').length;
    const linkCount = $('a').length;
    const internalLinks = $('a[href^="/"], a[href^="./"], a[href^="../"]').length;
    const externalLinks = $('a[href^="http"]').length;
    const wordCount = $('body').text().split(/\s+/).filter(w => w.length > 0).length;
    
    // Calculate scores
    const seoScore = calculateSeoScore($);
    const securityScore = calculateSecurityScore(response);
    const performanceScore = calculatePerformanceScore(response);
    const contentScore = calculateContentScore($);
    
    // Find issues
    const issues = findIssues($, response);

    return {
      url,
      title,
      metaDescription,
      h1Count,
      h2Count,
      imageCount,
      imagesWithAlt,
      imagesWithoutAlt: imageCount - imagesWithAlt,
      linkCount,
      internalLinks,
      externalLinks,
      wordCount,
      seoScore,
      securityScore,
      performanceScore,
      contentScore,
      issues,
      status: response.status,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Failed to analyze ${url}:`, error.message);
    return {
      url,
      error: error.message,
      status: 'failed'
    };
  }
};

// ✅ Calculate SEO Score
const calculateSeoScore = ($) => {
  let score = 60;
  
  if ($('title').length > 0 && $('title').text().trim().length > 0) {
    score += 10;
  }
  
  if ($('meta[name="description"]').length > 0) {
    const desc = $('meta[name="description"]').attr('content') || '';
    if (desc.length > 50 && desc.length < 160) {
      score += 10;
    } else if (desc.length > 0) {
      score += 5;
    }
  }
  
  if ($('h1').length > 0) {
    const h1Text = $('h1').first().text().trim();
    if (h1Text.length > 0) {
      score += 10;
    }
  }
  
  const images = $('img');
  const imagesWithAlt = images.filter((i, el) => {
    const alt = $(el).attr('alt');
    return alt !== undefined && alt !== null && alt.trim().length > 0;
  });
  if (images.length > 0 && imagesWithAlt.length / images.length >= 0.5) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

// ✅ Calculate Security Score
const calculateSecurityScore = (response) => {
  let score = 50;
  
  if (response.config.url && response.config.url.startsWith('https')) {
    score += 20;
  }
  
  const headers = response.headers || {};
  if (headers['strict-transport-security']) {
    score += 10;
  }
  if (headers['x-frame-options']) {
    score += 5;
  }
  if (headers['x-content-type-options']) {
    score += 5;
  }
  if (headers['content-security-policy']) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

// ✅ Calculate Performance Score
const calculatePerformanceScore = (response) => {
  let score = 60;
  const headers = response.headers || {};
  
  if (headers['content-encoding'] && 
      (headers['content-encoding'].includes('gzip') || 
       headers['content-encoding'].includes('br'))) {
    score += 15;
  }
  
  if (headers['cache-control']) {
    const cacheControl = headers['cache-control'].toLowerCase();
    if (cacheControl.includes('max-age') && 
        parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '0') > 0) {
      score += 15;
    } else {
      score += 5;
    }
  }
  
  if (headers['content-type'] && 
      headers['content-type'].includes('text/html')) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

// ✅ Calculate Content Score
const calculateContentScore = ($) => {
  let score = 60;
  const bodyText = $('body').text();
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount > 1000) {
    score += 20;
  } else if (wordCount > 500) {
    score += 15;
  } else if (wordCount > 300) {
    score += 10;
  } else if (wordCount > 100) {
    score += 5;
  }
  
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  if (h1Count >= 1 && h2Count >= 2) {
    score += 10;
  } else if (h1Count >= 1) {
    score += 5;
  }
  
  const imagesWithAlt = $('img[alt]').length;
  const totalImages = $('img').length;
  if (totalImages > 0 && imagesWithAlt / totalImages >= 0.5) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

// ✅ Find issues
const findIssues = ($, response) => {
  const issues = [];
  
  if ($('title').length === 0 || !$('title').text().trim()) {
    issues.push({ type: 'SEO', severity: 'Critical', message: 'Missing title tag' });
  }
  
  if ($('meta[name="description"]').length === 0) {
    issues.push({ type: 'SEO', severity: 'Warning', message: 'Missing meta description' });
  }
  
  if ($('h1').length === 0) {
    issues.push({ type: 'SEO', severity: 'Warning', message: 'No H1 heading found' });
  }
  
  if (!response.config.url.startsWith('https')) {
    issues.push({ type: 'Security', severity: 'Critical', message: 'SSL certificate not found' });
  }
  
  const images = $('img');
  images.each((i, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') {
      issues.push({ 
        type: 'SEO', 
        severity: 'Warning', 
        message: `Image missing alt text: ${$(el).attr('src') || 'unknown'}` 
      });
    }
  });
  
  return issues;
};

// ✅ Main competitor analysis function
exports.analyzeCompetitors = async (req, res) => {
  try {
    const { userUrl, competitorUrls } = req.body;
    
    if (!userUrl) {
      return res.status(400).json({
        success: false,
        message: 'Your website URL is required'
      });
    }
    
    if (!competitorUrls || competitorUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one competitor URL is required'
      });
    }

    console.log(`📊 Starting competitor analysis...`);
    console.log(`📍 Your site: ${userUrl}`);
    console.log(`📍 Competitors: ${competitorUrls.join(', ')}`);

    // ✅ Analyze user's website
    const userAnalysis = await analyzeWebsite(userUrl);
    
    if (userAnalysis.error) {
      return res.status(400).json({
        success: false,
        message: `Failed to analyze your website: ${userAnalysis.error}`
      });
    }

    // ✅ Analyze competitor websites
    const competitorAnalyses = [];
    for (const url of competitorUrls) {
      const result = await analyzeWebsite(url);
      competitorAnalyses.push(result);
    }

    // ✅ Calculate comparison scores
    const comparison = generateComparison(userAnalysis, competitorAnalyses);

    res.json({
      success: true,
      data: {
        user: userAnalysis,
        competitors: competitorAnalyses,
        comparison: comparison,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Competitor analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze competitors',
      error: error.message
    });
  }
};

// ✅ Generate comparison data
const generateComparison = (user, competitors) => {
  const validCompetitors = competitors.filter(c => !c.error);
  
  // Calculate competitor averages
  const avgSeo = validCompetitors.reduce((sum, c) => sum + (c.seoScore || 0), 0) / (validCompetitors.length || 1);
  const avgSecurity = validCompetitors.reduce((sum, c) => sum + (c.securityScore || 0), 0) / (validCompetitors.length || 1);
  const avgPerformance = validCompetitors.reduce((sum, c) => sum + (c.performanceScore || 0), 0) / (validCompetitors.length || 1);
  const avgContent = validCompetitors.reduce((sum, c) => sum + (c.contentScore || 0), 0) / (validCompetitors.length || 1);
  
  // Find best competitors
  const bestSeo = validCompetitors.reduce((best, c) => (c.seoScore || 0) > (best.seoScore || 0) ? c : best, validCompetitors[0]);
  const bestSecurity = validCompetitors.reduce((best, c) => (c.securityScore || 0) > (best.securityScore || 0) ? c : best, validCompetitors[0]);
  const bestPerformance = validCompetitors.reduce((best, c) => (c.performanceScore || 0) > (best.performanceScore || 0) ? c : best, validCompetitors[0]);
  const bestContent = validCompetitors.reduce((best, c) => (c.contentScore || 0) > (best.contentScore || 0) ? c : best, validCompetitors[0]);

  return {
    scores: {
      seo: {
        user: user.seoScore || 0,
        competitorAvg: Math.round(avgSeo),
        difference: (user.seoScore || 0) - Math.round(avgSeo),
        best: {
          name: bestSeo?.url || 'N/A',
          score: bestSeo?.seoScore || 0
        }
      },
      security: {
        user: user.securityScore || 0,
        competitorAvg: Math.round(avgSecurity),
        difference: (user.securityScore || 0) - Math.round(avgSecurity),
        best: {
          name: bestSecurity?.url || 'N/A',
          score: bestSecurity?.securityScore || 0
        }
      },
      performance: {
        user: user.performanceScore || 0,
        competitorAvg: Math.round(avgPerformance),
        difference: (user.performanceScore || 0) - Math.round(avgPerformance),
        best: {
          name: bestPerformance?.url || 'N/A',
          score: bestPerformance?.performanceScore || 0
        }
      },
      content: {
        user: user.contentScore || 0,
        competitorAvg: Math.round(avgContent),
        difference: (user.contentScore || 0) - Math.round(avgContent),
        best: {
          name: bestContent?.url || 'N/A',
          score: bestContent?.contentScore || 0
        }
      }
    },
    insights: generateInsights(user, validCompetitors)
  };
};

// ✅ Generate insights
const generateInsights = (user, competitors) => {
  const insights = [];
  
  // SEO insights
  if (user.seoScore < 70) {
    insights.push({
      area: 'SEO',
      type: 'warning',
      message: 'Your SEO score is below 70. Consider improving your meta tags and content structure.',
      suggestion: 'Add descriptive title tags, meta descriptions, and proper heading hierarchy.'
    });
  }
  
  if (user.h1Count === 0) {
    insights.push({
      area: 'SEO',
      type: 'critical',
      message: 'No H1 heading found on your page. This is important for SEO.',
      suggestion: 'Add at least one H1 heading that describes your page content.'
    });
  }
  
  // Security insights
  if (!user.url?.startsWith('https')) {
    insights.push({
      area: 'Security',
      type: 'critical',
      message: 'Your website is not using HTTPS. This is a security risk and SEO factor.',
      suggestion: 'Install an SSL certificate and redirect HTTP to HTTPS.'
    });
  }
  
  // Content insights
  if (user.wordCount < 500) {
    insights.push({
      area: 'Content',
      type: 'warning',
      message: 'Your page has less than 500 words. Longer content typically ranks better.',
      suggestion: 'Expand your content to at least 800-1000 words with valuable information.'
    });
  }
  
  // Competitor comparison insights
  const avgSeo = competitors.reduce((sum, c) => sum + (c.seoScore || 0), 0) / (competitors.length || 1);
  if (user.seoScore < avgSeo) {
    insights.push({
      area: 'Competitor',
      type: 'info',
      message: `Your SEO score (${user.seoScore}) is below the competitor average (${Math.round(avgSeo)}).`,
      suggestion: 'Analyze your competitors\' meta tags, content structure, and keywords to improve.'
    });
  }
  
  return insights;
};