// pages/Support.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Support = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");

  const APP_URL = "https://complyzo.albinolabs.com";
  const SUPPORT_DESK_URL = "https://supportalbinolabs.tawk.help/";

  const userCredentials = {
    appUrl: APP_URL,
    loginEmail: user?.email || "Your purchase email",
    defaultPassword: user?.email || "Your purchase email (default password)",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const loginFaqs = [
    {
      id: 1,
      question: "What is my login email?",
      answer: "Your login email is the email address you used to purchase ComplyZo. This is the email where you received your purchase confirmation and login credentials.",
      icon: "📧"
    },
    {
      id: 2,
      question: "What is my default password?",
      answer: "Your default password is exactly the same as your purchase email. For example, if you purchased with 'john@example.com', your default password is also 'john@example.com'. We recommend changing this after your first login for security.",
      icon: "🔑"
    },
    {
      id: 3,
      question: "How do I login to my account?",
      answer: "1. Go to complyzo.albinolabs.com\n2. Enter your purchase email as your login email\n3. Enter your purchase email as your password (same as login email)\n4. Click 'Login' to access your dashboard",
      icon: "🚀"
    },
    {
      id: 4,
      question: "I forgot my password. What should I do?",
      answer: "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your purchase email, and we'll send you a password reset link. You can then create a new password.",
      icon: "🔄"
    },
    {
      id: 5,
      question: "Can I change my password?",
      answer: "Yes! Once logged in, go to Settings > Security > Change Password. Enter your current password and your new password. Make sure to save your new password in a safe place.",
      icon: "🔐"
    },
    {
      id: 6,
      question: "Why is my password the same as my email?",
      answer: "For security and convenience, we automatically set your password to match your purchase email. This ensures you can login immediately after purchase. You can change this anytime from your settings.",
      icon: "💡"
    },
    {
      id: 7,
      question: "I'm having trouble logging in. What should I do?",
      answer: "If you're having trouble logging in, try these steps:\n1. Make sure you're using the correct email (the one you purchased with)\n2. Your password is the same as your email (case sensitive)\n3. Clear your browser cache and cookies\n4. Try a different browser or device\n5. If still having issues, contact our support team via live chat or email.",
      icon: "🆘"
    }
  ];

  const tabs = [
    { id: "credentials", label: "Login Credentials", icon: "🔑" },
    { id: "faq", label: "FAQ", icon: "❓" },
    { id: "help", label: "Help Topics", icon: "📚" },
  ];

  const helpTopics = [
    { title: "Getting Started", description: "Learn the basics of ComplyZo and get up and running quickly.", icon: "🚀", color: "#3b82f6" },
    { title: "Account & Billing", description: "Manage your account, billing and subscription.", icon: "💳", color: "#10b981" },
    { title: "Features Guide", description: "Explore all features and learn how to use them.", icon: "⚡", color: "#8b5cf6" },
    { title: "Troubleshooting", description: "Find solutions to common issues and errors.", icon: "🔧", color: "#f59e0b" },
    { title: "Integrations", description: "Connect ComplyZo with your favorite tools.", icon: "🔗", color: "#06b6d4" },
    { title: "API Documentation", description: "Technical documentation for developers.", icon: "📚", color: "#ec4899" },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = loginFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ===== HERO ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 p-8 md:p-12 mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              We're here to help 24/7
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">support</span> you?
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Get instant answers, find solutions, and connect with our support team.
            </p>
            
            <div className="max-w-xl mx-auto mt-6">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="flex items-center px-5">
                  <i className="fas fa-search text-white/50 text-lg"></i>
                  <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-white bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-white/40 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-white/50 hover:text-white transition"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          
          {/* ===== CREDENTIALS TAB ===== */}
          {activeTab === "credentials" && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🔑</span> Your Login Credentials
                </h2>
                <p className="text-blue-100 text-sm">Use these credentials to login to your account</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-2">
                          <i className="fas fa-envelope"></i> Login Email
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1 font-mono">
                          {userCredentials.loginEmail}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Your purchase email is your login email
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(userCredentials.loginEmail, "Login Email")}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center gap-2">
                          <i className="fas fa-key"></i> Default Password
                        </p>
                        <p className="text-lg font-bold text-amber-800 mt-1 font-mono">
                          {userCredentials.defaultPassword}
                        </p>
                        <p className="text-xs text-amber-500 mt-1">
                          ⚠️ Your purchase email is your default password
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(userCredentials.defaultPassword, "Default Password")}
                        className="p-3 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📌</span>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">How to Login</p>
                        <ol className="text-sm text-blue-700 mt-2 space-y-1.5 list-decimal list-inside">
                          <li>Go to <strong className="text-blue-900">{userCredentials.appUrl}</strong></li>
                          <li>Enter your <strong>Login Email</strong></li>
                          <li>Enter your <strong>Default Password</strong></li>
                          <li>Click <strong>Login</strong> to access your dashboard</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50/70 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔒</span>
                      <div>
                        <p className="text-sm font-semibold text-green-800">Security Tip</p>
                        <p className="text-sm text-green-700 mt-2 leading-relaxed">
                          For better security, we recommend changing your password after first login. 
                          Go to <strong>Settings → Security → Change Password</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== FAQ TAB ===== */}
          {activeTab === "faq" && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>❓</span> Frequently Asked Questions
                </h2>
                <p className="text-blue-100 text-sm">Common questions about logging into your account</p>
              </div>

              <div className="p-6">
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                          expandedFaq === faq.id
                            ? "border-blue-300 shadow-md bg-blue-50/30"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-5 py-4 text-left flex items-start gap-3 hover:bg-gray-50/50 transition"
                        >
                          <span className="text-2xl mt-0.5">{faq.icon}</span>
                          <span className="text-sm font-medium text-gray-800 pr-4 flex-1">
                            {faq.question}
                          </span>
                          <span className={`text-gray-400 transition-transform duration-300 flex-shrink-0 mt-1 ${
                            expandedFaq === faq.id ? "rotate-180 text-blue-500" : ""
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>

                        {expandedFaq === faq.id && (
                          <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500">No results found for "<strong>{searchQuery}</strong>"</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== CTA ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 text-center text-white shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Still Need Help?</h3>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Our support team is ready to assist you with any questions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={SUPPORT_DESK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
              >
                <i className="fas fa-headset"></i>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
