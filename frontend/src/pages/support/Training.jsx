// pages/Training.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import videoThumbnail from '../../assets/video-thumbnail.jpg'; 

const Training = () => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const faqContainerRef = useRef(null);

  // Demo Video Configuration
  const VIDEO_ID = 'YOUR_VIDEO_ID'; // Replace with your YouTube video ID
  const videoUrl = `https://drive.google.com/file/d/1rrbAY9ysOXyPU3IuLPVl8uJvG86TGbFr/view`;

  // Enhanced FAQ Data
  const faqs = [
    // Getting Started (5 FAQs)
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is ComplyZo and how does it work?',
      answer: 'ComplyZo is an AI-powered website compliance and optimization platform. It scans your website for SEO issues, security vulnerabilities, and compliance problems. Simply add your website URL, and our AI agents will analyze it and provide actionable recommendations to improve your website performance.',
      icon: '🤖'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I add my website?',
      answer: 'To add your website, login to your dashboard, click on "Add Website" button, enter your website URL (including https://), and click "Add". Our system will automatically start scanning your website. You can add multiple websites based on your plan.',
      icon: '➕'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'How long does it take to scan a website?',
      answer: 'A typical website scan takes 2-5 minutes depending on the size of your website. Larger websites with many pages may take longer. You can continue using the platform while the scan runs in the background.',
      icon: '⏱️'
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'What happens after I add my website?',
      answer: 'After adding your website, the system automatically starts scanning. You will receive a comprehensive report with scores for SEO, Security, Compliance, and Performance. You can also chat with AI agents to get specific recommendations.',
      icon: '📊'
    },
    {
      id: 5,
      category: 'Getting Started',
      question: 'Can I change my website URL later?',
      answer: 'Yes, you can update your website URL from the Settings page. However, please note that changing the URL will trigger a new scan to analyze the new website.',
      icon: '🔄'
    },

    // AI Agents (6 FAQs)
    {
      id: 6,
      category: 'AI Agents',
      question: 'What are AI Agents and how can they help me?',
      answer: 'AI Agents are specialized AI assistants that help you with different tasks. We have Profit Agents (for marketing, e-commerce, content) and Ranker Agents (for SEO, keyword research, link building). Each agent provides expert guidance in their specific area, just like having a team of experts on demand.',
      icon: '🧠'
    },
    {
      id: 7,
      category: 'AI Agents',
      question: 'How do I use the AI Profit agents?',
      answer: 'Go to AI Profit section in the sidebar, choose an agent that matches your needs (e.g., Digital Marketing Pro, Ecommerce Expert, Content Creator), and start a conversation. The agent will guide you with strategies to grow your business, increase revenue, and optimize your marketing efforts.',
      icon: '💰'
    },
    {
      id: 8,
      category: 'AI Agents',
      question: 'How do I use the AI Ranker agents?',
      answer: 'Go to AI Ranker section in the sidebar, select an SEO agent (e.g., SEO Audit Pro, Keyword Genius, Link Builder Pro), and ask questions about improving your website ranking. The agent will provide SEO recommendations, keyword strategies, and link building techniques.',
      icon: '📈'
    },
    {
      id: 9,
      category: 'AI Agents',
      question: 'Can I chat with multiple AI agents?',
      answer: 'Yes! You can chat with multiple AI agents simultaneously. Each conversation is saved separately, and you can switch between them anytime. This allows you to get expert advice on different aspects of your business at the same time.',
      icon: '💬'
    },
    {
      id: 10,
      category: 'AI Agents',
      question: 'Are the AI agents available 24/7?',
      answer: 'Yes! All AI agents are available 24/7. You can chat with them anytime, anywhere. Whether you need help at 2 AM or on weekends, our AI agents are always ready to assist you.',
      icon: '🕐'
    },
    {
      id: 11,
      category: 'AI Agents',
      question: 'How accurate are the AI agents?',
      answer: 'Our AI agents are powered by advanced language models and are continuously trained on the latest industry data. They provide accurate, up-to-date information and recommendations. However, we always recommend consulting with human experts for critical business decisions.',
      icon: '🎯'
    },

    // Scanning (6 FAQs)
    {
      id: 12,
      category: 'Scanning',
      question: 'How often should I scan my website?',
      answer: 'We recommend scanning your website weekly to catch new issues early. However, the frequency depends on how often you update your website. For websites with frequent updates, we recommend daily scans. You can set up automated scans in the Automation section.',
      icon: '📅'
    },
    {
      id: 13,
      category: 'Scanning',
      question: 'What does a website scan check for?',
      answer: 'Our comprehensive scan checks for: SEO issues (meta tags, headings, alt text), Security vulnerabilities (SSL, headers, malware), Compliance (GDPR, privacy policy, cookie consent), and Performance (page speed, compression, caching, Core Web Vitals).',
      icon: '🔍'
    },
    {
      id: 14,
      category: 'Scanning',
      question: 'What do the scores mean?',
      answer: 'Each scan provides scores for SEO, Security, Compliance, and Performance (0-100). Higher scores mean better optimization. The scores are calculated based on best practices and industry standards. Scores above 80 are considered excellent.',
      icon: '📊'
    },
    {
      id: 15,
      category: 'Scanning',
      question: 'Can I scan password-protected websites?',
      answer: 'Currently, we only scan public websites that are accessible without authentication. For password-protected or private websites, please contact our support team for assistance.',
      icon: '🔒'
    },
    {
      id: 16,
      category: 'Scanning',
      question: 'What happens if my website has SSL issues?',
      answer: 'If SSL issues are detected, we provide detailed recommendations on how to fix them. This includes installing a valid SSL certificate, updating internal links to HTTPS, and fixing mixed content warnings.',
      icon: '🛡️'
    },
    {
      id: 17,
      category: 'Scanning',
      question: 'Can I download scan reports?',
      answer: 'Yes! You can download scan reports in PDF format. Simply go to the Reports section, select the scan you want to download, and click the "Download PDF" button. This is useful for sharing with clients or team members.',
      icon: '📄'
    },

    // Automation (4 FAQs)
    {
      id: 18,
      category: 'Automation',
      question: 'How do I set up automated scans?',
      answer: 'Go to Automation settings in your dashboard, select your website, choose a frequency (Daily, Weekly, Monthly), set your preferred time and timezone, and enable notifications. The system will automatically scan your website at the scheduled time.',
      icon: '⚙️'
    },
    {
      id: 19,
      category: 'Automation',
      question: 'Will I get notifications about scan results?',
      answer: 'Yes! You can enable email and WhatsApp notifications for scan results. You can also choose to receive notifications only for critical issues or all issues found during the scan. This helps you stay informed without being overwhelmed.',
      icon: '🔔'
    },
    {
      id: 20,
      category: 'Automation',
      question: 'Can I pause automated scans?',
      answer: 'Yes, you can pause automated scans anytime from the Automation settings. Simply toggle off the "Active" switch for the specific website. You can resume the scans whenever you want.',
      icon: '⏸️'
    },
    {
      id: 21,
      category: 'Automation',
      question: 'Do automated scans affect website performance?',
      answer: 'No, our scans are designed to be lightweight and do not affect your website performance. We use efficient scanning methods that minimize server load. Your website visitors will not experience any slowdown during scans.',
      icon: '⚡'
    },

    // Plans & Pricing (5 FAQs)
    {
      id: 22,
      category: 'Plans & Pricing',
      question: 'What plans are available?',
      answer: 'We offer three plans: Free (basic scans, 1 website, limited AI agents), Unlimited Silver (unlimited scans, unlimited websites, all AI agents, priority support, team members 3), and Unlimited Gold (everything in Silver + VIP support, white-label reports, API access, team members 10).',
      icon: '💎'
    },
    {
      id: 23,
      category: 'Plans & Pricing',
      question: 'Can I upgrade my plan later?',
      answer: 'Yes! You can upgrade to a higher plan at any time. Simply go to the Upgrade page in your dashboard and choose the plan that best fits your needs. The upgrade is instant and you get immediate access to all new features.',
      icon: '⬆️'
    },
    {
      id: 24,
      category: 'Plans & Pricing',
      question: 'Do you offer discounts for annual plans?',
      answer: 'Yes, we offer 20% discount on annual plans. This means you can save significantly by choosing an annual subscription. Contact our sales team for more details on annual pricing.',
      icon: '💰'
    },
    {
      id: 25,
      category: 'Plans & Pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment partners JVZoo and LaunchPad.',
      icon: '💳'
    },
    {
      id: 26,
      category: 'Plans & Pricing',
      question: 'Is there a money-back guarantee?',
      answer: 'Yes! We offer a 30-day money-back guarantee. If you are not satisfied with our service for any reason, we will refund your purchase within the first 30 days, no questions asked.',
      icon: '✅'
    },

    // Security (5 FAQs)
    {
      id: 27,
      category: 'Security',
      question: 'Is my website data safe?',
      answer: 'Yes, your data is completely safe. All data is encrypted and stored securely. We use industry-standard security practices to protect your information, including AES-256 encryption, regular security audits, and strict access controls.',
      icon: '🛡️'
    },
    {
      id: 28,
      category: 'Security',
      question: 'Does ComplyZo store my website content?',
      answer: 'We only scan and analyze your website content for the purpose of providing reports and recommendations. We do not store or share your website content with third parties. All scan data is deleted after 30 days unless you choose to save it.',
      icon: '📁'
    },
    {
      id: 29,
      category: 'Security',
      question: 'How is my personal information protected?',
      answer: 'We follow strict data protection practices. Your personal information is encrypted and stored securely. We never share your information with third parties without your explicit consent. We are GDPR and CCPA compliant.',
      icon: '🔐'
    },
    {
      id: 30,
      category: 'Security',
      question: 'Do you have a privacy policy?',
      answer: 'Yes, we have a comprehensive privacy policy that explains how we collect, use, and protect your data. You can view our privacy policy anytime in the footer of our website.',
      icon: '📋'
    },
    {
      id: 31,
      category: 'Security',
      question: 'What happens if there is a data breach?',
      answer: 'In the unlikely event of a data breach, we have protocols in place to notify affected users immediately and take corrective action. We also have cyber insurance to cover any potential damages.',
      icon: '🚨'
    },

    // General (6 FAQs)
    {
      id: 32,
      category: 'General',
      question: 'How do I contact support?',
      answer: 'You can contact our support team through the Support page in your dashboard, or email us at support@complyzo.com. We respond within 24 hours. For urgent issues, you can also use the live chat feature available on our website.',
      icon: '📧'
    },
    {
      id: 33,
      category: 'General',
      question: 'Can I use ComplyZo for multiple websites?',
      answer: 'Yes! With our Unlimited plans, you can add and scan unlimited websites. The Free plan allows you to add only 1 website. This is perfect for agencies and freelancers managing multiple client websites.',
      icon: '🌐'
    },
    {
      id: 34,
      category: 'General',
      question: 'Do you offer API access?',
      answer: 'Yes, API access is available with our Unlimited Gold plan. This allows you to integrate ComplyZo with your own applications, automate scans, and retrieve scan results programmatically.',
      icon: '🔌'
    },
    {
      id: 35,
      category: 'General',
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription anytime from your account settings. Your subscription will remain active until the end of your current billing period. No cancellation fees.',
      icon: '🚫'
    },
    {
      id: 36,
      category: 'General',
      question: 'Do you offer white-label solutions?',
      answer: 'Yes, white-label solutions are available with our Unlimited Gold plan. You can customize the platform with your own branding, logo, and colors. This is ideal for agencies looking to offer ComplyZo as their own service.',
      icon: '🏷️'
    },
    {
      id: 37,
      category: 'General',
      question: 'How do I invite team members?',
      answer: 'Team member invites are available for Unlimited Silver (3 members) and Unlimited Gold (10 members) plans. Simply go to the Team section in your dashboard, enter their email addresses, and send invites.',
      icon: '👥'
    }
  ];

  // Get unique categories
  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Get category counts
  const categoryCounts = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {});

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCategory = (category) => {
    const element = document.getElementById(`faq-${category.replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto custom-scroll" ref={faqContainerRef}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🎓</span> 
                Training Center
              </h1>
              <p className="text-gray-500 mt-1">Watch our demo video and find answers to common questions</p>
            </div>

            {/* Demo Video Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>▶️</span> Demo Video
                </h2>
                <p className="text-blue-100 text-sm">Watch this quick demo to get started with ComplyZo</p>
              </div>
              
              <div className="p-4 md:p-6">
                {/* Video Player with Thumbnail */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg group">
                  {!isVideoPlaying ? (
                    <>
                      {/* Thumbnail Image */}
                      {!thumbnailError && (
                        <img
                          src={videoThumbnail}
                          alt="ComplyZo Demo Video Thumbnail"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={() => setThumbnailError(true)}
                        />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Play Button */}
                      <button
                        onClick={handlePlayVideo}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                      >
                        <div className="relative">
                          {/* Pulse Ring Animation */}
                          <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
                          
                          {/* Outer Circle */}
                          <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xl border-2 border-white/30">
                            {/* Inner Circle */}
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-gray-100 transition">
                              <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <p className="text-white font-semibold text-sm md:text-base flex items-center gap-2">
                          <span className="text-blue-400">▶</span> Watch Demo Video
                        </p>
                        <p className="text-gray-300 text-xs">Click play to watch the demo • ~5 minutes</p>
                      </div>

                      {/* HD Badge */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2 border border-white/10">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        HD
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs font-medium">
                        ⏱️ 5:00
                      </div>
                    </>
                  ) : (
                    // Video Player (when playing)
                    <iframe
                      src={videoUrl}
                      title="ComplyZo Demo"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      frameBorder="0"
                    ></iframe>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-700">~5 minutes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Topics</p>
                    <p className="font-semibold text-gray-700">Getting Started</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-700">July 2024</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Difficulty</p>
                    <p className="font-semibold text-gray-700">Beginner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-3xl mb-1">📹</div>
                <div className="text-2xl font-bold text-gray-800">1</div>
                <div className="text-xs text-gray-500">Demo Video</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-3xl mb-1">❓</div>
                <div className="text-2xl font-bold text-gray-800">{faqs.length}</div>
                <div className="text-xs text-gray-500">FAQs</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-3xl mb-1">📂</div>
                <div className="text-2xl font-bold text-gray-800">{categories.length - 1}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-3xl mb-1">🔄</div>
                <div className="text-2xl font-bold text-gray-800">24/7</div>
                <div className="text-xs text-gray-500">Support Available</div>
              </div>
            </div>

            {/* FAQ Section - Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - FAQ Content */}
              <div className="flex-1 lg:order-1">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>❓</span> Frequently Asked Questions
                    </h2>
                    <p className="text-purple-100 text-sm">Find answers to common questions about ComplyZo</p>
                  </div>

                  <div className="p-4 md:p-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Results count */}
                    <p className="text-xs text-gray-400 mb-4">
                      Showing {filteredFaqs.length} of {faqs.length} FAQs
                    </p>

                    {/* FAQ Items by Category */}
                    {Object.keys(groupedFaqs).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-700">No FAQs Found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                          className="mt-4 text-sm text-purple-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                        <div key={category} className="mb-8 last:mb-0">
                          <h3 
                            id={`faq-${category.replace(/\s+/g, '-')}`}
                            className="text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg mb-4 sticky top-0 z-10 flex items-center gap-2"
                          >
                            <span>📂</span> {category} ({categoryFaqs.length})
                          </h3>
                          
                          <div className="space-y-3">
                            {categoryFaqs.map((faq) => (
                              <div 
                                key={faq.id}
                                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-purple-200 hover:shadow-sm"
                              >
                                <button
                                  onClick={() => toggleFaq(faq.id)}
                                  className="w-full px-5 py-4 text-left flex items-start gap-3 hover:bg-gray-50 transition"
                                >
                                  <span className="text-xl mt-0.5">{faq.icon}</span>
                                  <span className="text-sm font-medium text-gray-800 pr-4 flex-1">
                                    {faq.question}
                                  </span>
                                  <span className={`text-gray-400 transition-transform duration-300 flex-shrink-0 mt-1 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </span>
                                </button>
                                
                                {expandedFaq === faq.id && (
                                  <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {faq.answer}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Help Section */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 text-center">
                      <p className="text-gray-600 mb-3">
                        Still have questions? We're here to help!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a 
                          href="/support" 
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition inline-flex items-center justify-center gap-2"
                        >
                          <span>📧</span> Contact Support
                        </a>
                        <a 
                          href="/dashboard" 
                          className="px-6 py-2.5 bg-white border-2 border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition inline-flex items-center justify-center gap-2"
                        >
                          <span>🚀</span> Go to Dashboard
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Category Navigation (Sticky) */}
              <div className="lg:w-72 lg:order-2 flex-shrink-0">
                <div className="lg:sticky lg:top-6">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>📂</span> Categories
                      </h3>
                    </div>
                    
                    <div className="p-4">
                      {/* All Categories */}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1 ${
                          selectedCategory === 'all'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>📋 All Questions</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {faqs.length}
                          </span>
                        </div>
                      </button>

                      {/* Category List */}
                      {categories.filter(c => c !== 'all').map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            scrollToCategory(category);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1 ${
                            selectedCategory === category
                              ? 'bg-purple-100 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{category}</span>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {categoryCounts[category] || 0}
                            </span>
                          </div>
                        </button>
                      ))}

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-3"></div>

                      {/* Quick Jump */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-2">Quick Jump</p>
                        {categories.filter(c => c !== 'all').slice(0, 5).map((category) => (
                          <button
                            key={`jump-${category}`}
                            onClick={() => {
                              setSelectedCategory(category);
                              scrollToCategory(category);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition"
                          >
                            → {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Card */}
                  <div className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>📊</span> Quick Stats
                      </h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total FAQs</span>
                        <span className="font-semibold text-gray-800">{faqs.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Categories</span>
                        <span className="font-semibold text-gray-800">{categories.length - 1}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Demo Videos</span>
                        <span className="font-semibold text-gray-800">1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Support</span>
                        <span className="font-semibold text-green-600">24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              <p>© 2024 ComplyZo. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scroll {
          scroll-behavior: smooth;
        }
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Training;
