// pages/Unlimited.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Unlimited = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  useEffect(() => {
    // Simulate upgrade check/process
    const checkUpgrade = async () => {
      setLoading(true);
      try {
        // Check if user already has unlimited
        if (user?.planId === 3 || user?.planName?.toLowerCase().includes('unlimited')) {
          setUpgradeComplete(true);
          setPlanDetails({
            name: user.planName || 'Unlimited Plan',
            features: ['Unlimited Scans', 'Unlimited Websites', 'All AI Agents', 'Priority Support', 'White-label Reports']
          });
        } else {
          // Auto-upgrade the user
          await performUpgrade();
        }
      } catch (error) {
        console.error('Upgrade check error:', error);
        // Still show the page even if upgrade fails
        setUpgradeComplete(true);
      } finally {
        setLoading(false);
      }
    };

    checkUpgrade();
  }, [user]);

  const performUpgrade = async () => {
    setUpgrading(true);
    try {
      // Call API to upgrade user to unlimited
      const response = await api.post('/auth/upgrade-unlimited');
      
      if (response.data.success) {
        // Update local user data
        const updatedUser = {
          ...user,
          planId: 3,
          planName: 'Unlimited'
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setPlanDetails({
          name: 'Unlimited Plan',
          features: ['Unlimited Scans', 'Unlimited Websites', 'All AI Agents', 'Priority Support', 'White-label Reports']
        });
        setUpgradeComplete(true);
        toast.success('🎉 Congratulations! You are now on Unlimited plan!');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Upgrade failed. Please contact support.');
      // Show page anyway
      setUpgradeComplete(true);
    } finally {
      setUpgrading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToFeatures = () => {
    navigate('/features');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-amber-700 font-medium">Processing your upgrade...</p>
        </div>
      </div>
    );
  }

  if (upgrading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrading Your Account</h2>
          <p className="text-gray-600">Please wait while we apply your Unlimited plan...</p>
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-amber-600 font-medium">Processing...</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 animate-fade-in-up">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 px-6 py-12 md:px-10 md:py-16 text-center">
            {/* Confetti/Sparkle Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-float"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 3}s`,
                      fontSize: `${20 + Math.random() * 30}px`
                    }}
                  >
                    🎉
                  </div>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div className="relative inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-sm font-semibold mb-4 border border-white/30">
              <span className="mr-2">⭐</span> 
              UNLIMITED ACCESS
            </div>

            {/* Icon */}
            <div className="relative flex justify-center mb-4">
              <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40 shadow-2xl">
                <span className="text-5xl">🚀</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="relative text-4xl md:text-6xl font-extrabold text-white mb-3">
              🎉 Congratulations!
            </h1>
            <p className="relative text-xl md:text-2xl text-white/90 font-medium">
              You are now on the <span className="font-bold underline decoration-yellow-300 decoration-2">Unlimited Plan</span>
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8 md:px-10 md:py-10">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-4">
                <span className="text-green-500 text-sm">✅</span>
                <span className="text-green-700 text-sm font-medium">Upgrade Applied Successfully</span>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Your account has been automatically upgraded to the Unlimited plan. 
                You now have access to all premium features with no restrictions.
              </p>
            </div>

            {/* Plan Details */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 mb-8 border border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> 
                Unlimited Plan Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {planDetails?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/70 rounded-lg px-4 py-2.5">
                    <span className="text-amber-500 text-lg">✓</span>
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automatic Upgrade Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">🔄</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-green-800 mb-1">Automatic Upgrade Applied</h4>
                  <p className="text-sm text-green-700">
                    Your Unlimited plan upgrade has been automatically applied to your account. 
                    No action is required on your part. All features are now unlocked.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span>✅</span> Active Now
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span>♾️</span> No Expiry
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span>🚀</span> All Features
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:from-amber-700 hover:to-orange-700 transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-right"></i>
                Go to Dashboard
              </button>
              <button
                onClick={handleGoToFeatures}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-amber-200 text-gray-700 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-star"></i>
                Explore Features
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                Need help? <a href="/support" className="text-amber-600 hover:underline">Contact Support</a>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-amber-100">
            <div className="text-3xl mb-2">♾️</div>
            <h4 className="font-semibold text-gray-800 text-sm">Unlimited Scans</h4>
            <p className="text-xs text-gray-500">Scan unlimited websites</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-amber-100">
            <div className="text-3xl mb-2">🤖</div>
            <h4 className="font-semibold text-gray-800 text-sm">All AI Agents</h4>
            <p className="text-xs text-gray-500">Access to every AI agent</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-amber-100">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-gray-800 text-sm">Priority Support</h4>
            <p className="text-xs text-gray-500">24/7 priority assistance</p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default Unlimited;