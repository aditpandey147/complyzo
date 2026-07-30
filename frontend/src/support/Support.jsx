// pages/Support.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Support = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // App URL (replace with your actual URL)
  const APP_URL = "https://complyzo.albinolabs.com";
  const SUPPORT_DESK_URL = "https://supportalbinolabs.tawk.help/";

  // User credentials
  const userCredentials = {
    appUrl: APP_URL,
    loginEmail: user?.email || "Your purchase email",
    purchaseEmail: user?.email || "Your purchase email",
    defaultPassword: user?.email || "Your purchase email (default password)",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  // Login FAQs
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

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-3">
            <span className="text-4xl">🆘</span>
            Support Center
          </h1>
          <p className="text-gray-500 mt-1">
            Get help and support for your ComplyZo account
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-3xl mb-1">🛡️</div>
            <p className="text-sm font-semibold text-gray-800">24/7 Support</p>
            <p className="text-xs text-gray-500">We're here anytime</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-3xl mb-1">⚡</div>
            <p className="text-sm font-semibold text-gray-800">Fast Response</p>
            <p className="text-xs text-gray-500">Within 2-4 hours</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-3xl mb-1">🔒</div>
            <p className="text-sm font-semibold text-gray-800">Secure</p>
            <p className="text-xs text-gray-500">Your data is safe</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-3xl mb-1">⭐</div>
            <p className="text-sm font-semibold text-gray-800">Trusted</p>
            <p className="text-xs text-gray-500">10,000+ users</p>
          </div>
        </div>

        {/* Login Credentials Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden border-2 border-blue-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔑</span> Your Login Credentials
            </h2>
            <p className="text-blue-100 text-sm">
              Use these credentials to login to your account
            </p>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Login Email */}
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      Login Email
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {userCredentials.loginEmail}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Your purchase email is your login email
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(userCredentials.loginEmail, "Login Email")
                    }
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>

              {/* Default Password */}
              <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                      Default Password
                    </p>
                    <p className="text-sm font-semibold text-amber-800 mt-1">
                      {userCredentials.defaultPassword}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-0.5">
                      ⚠️ Your purchase email is your default password
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        userCredentials.defaultPassword,
                        "Default Password",
                      )
                    }
                    className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* How to Login */}
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">📌</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    How to Login
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>
                      1. Go to{" "}
                      <strong className="text-blue-900">
                        {userCredentials.appUrl}
                      </strong>
                    </li>
                    <li>
                      2. Enter your <strong>Login Email</strong>:{" "}
                      <span className="bg-blue-100 px-2 py-0.5 rounded text-xs font-mono">
                        {userCredentials.loginEmail}
                      </span>
                    </li>
                    <li>
                      3. Enter your <strong>Default Password</strong>:{" "}
                      <span className="bg-amber-100 px-2 py-0.5 rounded text-xs font-mono">
                        {userCredentials.defaultPassword}
                      </span>
                    </li>
                    <li>
                      4. Click <strong>Login</strong> to access your dashboard
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Security Tip
                  </p>
                  <p className="text-sm text-green-700">
                    For better security, we recommend changing your password after first login. 
                    Go to Settings → Security → Change Password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login FAQs Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>❓</span> Login FAQs
            </h2>
            <p className="text-blue-100 text-sm">
              Common questions about logging into your account
            </p>
          </div>

          <div className="p-4 md:p-6">
            <div className="space-y-3">
              {loginFaqs.map((faq) => (
                <div 
                  key={faq.id}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-200"
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
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Desk Link */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
          <p className="text-blue-100 mb-4">
            Visit our support desk for tickets, knowledge base, and live chat
          </p>
          <a
            href={SUPPORT_DESK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
          >
            <i className="fas fa-external-link-alt mr-2"></i>
            Go to Support Desk
          </a>
        </div>

        {/* Trust Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Why Trust ComplyZo?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-2">🛡️</div>
                <p className="font-semibold text-gray-800">Secure & Reliable</p>
                <p className="text-sm text-gray-500">Your data is encrypted and protected with industry-standard security</p>
              </div>
              <div>
                <div className="text-4xl mb-2">⭐</div>
                <p className="font-semibold text-gray-800">Trusted by Thousands</p>
                <p className="text-sm text-gray-500">10,000+ users trust ComplyZo for their website compliance</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💬</div>
                <p className="font-semibold text-gray-800">Dedicated Support</p>
                <p className="text-sm text-gray-500">Our support team is available 24/7 to help you succeed</p>
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
  );
};

export default Support;