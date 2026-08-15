import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/websites');
      
      let websitesData = [];
      if (Array.isArray(response.data)) {
        websitesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        websitesData = response.data.websites || response.data.data || [];
      }
      
      setWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (website) => {
    setWebsiteToDelete(website);
    setShowDeletePopup(true);
  };

  const handleDeleteWebsite = async () => {
    if (!websiteToDelete) return;
    
    const websiteId = websiteToDelete._id || websiteToDelete.id;
    const websiteUrl = websiteToDelete.url;
    
    setDeleting(websiteId);
    setShowDeletePopup(false);
    
    try {
      await api.delete(`/websites/${websiteId}`);
      
      toast.success(`Successfully deleted ${websiteUrl}`);
      setWebsites(prev => prev.filter(w => (w._id || w.id) !== websiteId));
      
    } catch (error) {
      console.error('Error deleting website:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete website');
      }
    } finally {
      setDeleting(null);
      setWebsiteToDelete(null);
    }
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPlanBadge = () => {
    const plan = user?.planName || user?.plan || 'Free';
    
    const planDisplay = {
      'Free': { bg: 'bg-gray-100 text-gray-700', icon: 'fa-box', label: 'Free Plan' },
      'Starter': { bg: 'bg-blue-100 text-blue-700', icon: 'fa-rocket', label: 'Starter Plan' },
      'Pro': { bg: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white', icon: 'fa-crown', label: 'Pro Plan' },
      'Growth': { bg: 'bg-green-100 text-green-700', icon: 'fa-chart-line', label: 'Growth Plan' },
      'Enterprise': { bg: 'bg-purple-100 text-purple-700', icon: 'fa-building', label: 'Enterprise Plan' },
    };

    const config = planDisplay[plan] || planDisplay['Free'];

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg}`}>
        <i className={`fas ${config.icon} mr-1 text-xs`}></i> {config.label}
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] overflow-auto">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                  {/* User Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-lg font-semibold mt-3">{user?.name || 'User'}</h3>
                    <p className="text-sm text-blue-100">{user?.email || 'No email'}</p>
                  </div>

                  {/* User Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">Plan</span>
                      <span>{getPlanBadge()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">Member Since</span>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">Role</span>
                      <span className={`text-sm font-medium px-3 py-0.5 rounded-full ${
                        user?.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user?.role || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Info (Read Only) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-blue-500"></i>
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Name cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-lock text-blue-500"></i>
                        Security
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Change your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <i className="fas fa-key"></i>
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Websites Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-globe text-blue-500"></i>
                      <h3 className="text-lg font-semibold text-gray-900">Your Websites</h3>
                    </div>
                    <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      {websites.length} {websites.length === 1 ? 'website' : 'websites'}
                    </span>
                  </div>

                  {websites.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                        <i className="fas fa-globe text-gray-300 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-500">No websites added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add your first website to start monitoring</p>
                      <button
                        onClick={() => window.location.href = '/add-website'}
                        className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <i className="fas fa-plus-circle mr-2"></i>
                        Add Website
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {websites.map((website) => (
                        <div
                          key={website._id || website.id}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-link text-blue-500 text-xs"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{website.url}</p>
                              <p className="text-[10px] text-gray-400">
                                Added: {formatDate(website.createdAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => confirmDelete(website)}
                            disabled={deleting === (website._id || website.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            {deleting === (website._id || website.id) ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-trash-alt text-xs"></i>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-key text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  <p className="text-sm opacity-90">Update your account password</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-save"></i>
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && websiteToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-trash-alt text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Website</h3>
                  <p className="text-sm opacity-90">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong className="font-semibold text-red-600">{websiteToDelete.url}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This will permanently remove the website and all its scan data from your account.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setWebsiteToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWebsite}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Settings;
