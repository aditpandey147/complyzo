import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/nav-logo.png";
import api from "../../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMasterPassword, setIsMasterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  // Handle Google callback token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get("token");
    if (googleToken) {
      localStorage.setItem("token", googleToken);
      api.defaults.headers.common["x-auth-token"] = googleToken;

      api
        .get("/auth/me")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          window.location.href = "/dashboard";
        })
        .catch(() => {
          window.location.href = "/login?error=google_failed";
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setIsMasterPassword(false);

    const success = await login(email, password);

    if (success) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      if (userData.isMasterLogin) {
        setIsMasterPassword(true);
        toast.success("🔑 Logged in with Master Password!", {
          icon: "🔑",
          duration: 3000,
        });
      }

      window.location.href = "/dashboard";
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>

          {/* Animated Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-particle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          {/* Animated Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating Shapes */}
          <div className="absolute top-20 right-20 animate-float">
            <div className="w-16 h-16 border-4 border-white/20 rounded-2xl rotate-12 backdrop-blur-sm"></div>
          </div>
          <div className="absolute bottom-32 left-20 animate-float-delay">
            <div className="w-12 h-12 border-4 border-white/10 rounded-full backdrop-blur-sm"></div>
          </div>
          <div className="absolute top-1/2 right-10 animate-float-medium">
            <div className="w-8 h-8 border-4 border-white/10 rounded-lg rotate-45 backdrop-blur-sm"></div>
          </div>

          {/* Static Globe Icon */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <svg
              className="w-96 h-96"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
        </div>

        {/* Animated Code Lines */}
        <div className="absolute bottom-40 left-10 opacity-20 font-mono text-xs leading-relaxed animate-code-scroll">
          <div className="text-green-400">&lt;!DOCTYPE html&gt;</div>
          <div className="text-blue-400">&lt;html lang="en"&gt;</div>
          <div className="text-purple-400">&lt;head&gt;</div>
          <div className="text-yellow-400">
            &lt;title&gt;ComplyZo&lt;/title&gt;
          </div>
          <div className="text-purple-400">&lt;/head&gt;</div>
          <div className="text-blue-400">&lt;body&gt;</div>
          <div className="text-green-400">
            &lt;!-- Secure &amp; Compliant --&gt;
          </div>
          <div className="text-blue-400">&lt;/body&gt;</div>
          <div className="text-blue-400">&lt;/html&gt;</div>
        </div>

        {/* Left Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img src={logo} alt="complyzo logo" className="w-42 h-8 brightness-0 invert" />
              </Link>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4 animate-slide-up">
              Monitor, Analyze & Secure
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Website
              </span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed animate-slide-up-delay">
              ComplyZo helps you find and fix website issues instantly with
              AI-powered solutions. No technical skills required.
            </p>

            {/* Animated Feature Cards */}
            <div className="mt-8 space-y-3">
              {[
                {
                  icon: "🔍",
                  text: "AI-Powered Website Scanning",
                  color: "from-blue-500/20 to-blue-600/20",
                },
                {
                  icon: "🛡️",
                  text: "Security & Compliance Monitoring",
                  color: "from-purple-500/20 to-purple-600/20",
                },
                {
                  icon: "📈",
                  text: "SEO & Performance Optimization",
                  color: "from-green-500/20 to-green-600/20",
                },
                {
                  icon: "🤖",
                  text: "One-Click AI Fixes",
                  color: "from-orange-500/20 to-orange-600/20",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 bg-gradient-to-r ${item.color} backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] cursor-default animate-feature-slide`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white/80 text-sm font-medium">
                    {item.text}
                  </span>
                  <span className="ml-auto text-white/20 text-xs animate-pulse-slow">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-sm flex items-center gap-6">
          <p>© 2024 ComplyZo. All rights reserved.</p>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-white/30">All systems operational</span>
          </span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={logo} alt="complyzo logo" className="w-42 h-8" />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">
              Sign in to your account to continue
            </p>

            {isMasterPassword && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 animate-fade-in">
                <span className="text-amber-600 text-sm">🔑</span>
                <span className="text-xs text-amber-700 font-medium">
                  Logged in with Master Password
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email with Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password with Icon and Show/Hide */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Need support?{" "}
            <a
              href="/support"
              className="text-blue-600 font-semibold hover:underline"
            >
              Contact Support
            </a>
          </p>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> SSL Secured
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 24/7 Support
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Free Trial
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-40px, 20px) rotate(10deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.2); }
        }
        @keyframes code-scroll {
          0% { transform: translateY(0); opacity: 0.2; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-20px); opacity: 0.2; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes feature-slide {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(50px, -50px) scale(2); opacity: 0.6; }
          100% { transform: translate(100px, -100px) scale(1); opacity: 0.2; }
        }

        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 10s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-code-scroll { animation: code-scroll 8s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-slide-up-delay { animation: slide-up-delay 0.8s ease-out 0.3s both; }
        .animate-feature-slide { animation: feature-slide 0.6s ease-out both; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-particle { animation: particle 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default Login;
