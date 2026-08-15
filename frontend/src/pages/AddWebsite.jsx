import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AddWebsite = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setFetching(true);
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
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/websites', { url });
      
      toast.success('Website added successfully!');
      setUrl('');
      await fetchWebsites();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add website');
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
      await fetchWebsites();
      
    } catch (error) {
      console.error('Error deleting website:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete website');
      }
    } finally {
      setDeleting(null);
      setWebsiteToDelete(null);
    }
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

  return (
    <div className="flex h-screen bg-white" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.02) 0%, transparent 50%)' }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] overflow-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">+</span>
                Add Website
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-11">Enter a website URL to start monitoring</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-50/50 to-blue-50/50 rounded-full blur-3xl -ml-16 -mb-16"></div>
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <i className="fa-solid fa-link text-blue-500 mr-2"></i>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <i className="fa-solid fa-info-circle text-gray-300"></i>
                    Include http:// or https:// for best results
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-100/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm">📊</div>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-gray-800 mb-1.5">What we'll monitor:</p>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2 text-gray-600">
                          <i className="fa-solid fa-check-circle text-blue-400 text-xs"></i>
                          SEO elements (titles, descriptions, headings)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <i className="fa-solid fa-check-circle text-blue-400 text-xs"></i>
                          Security features (HTTPS, headers)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <i className="fa-solid fa-check-circle text-blue-400 text-xs"></i>
                          Compliance (cookies, policies)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <i className="fa-solid fa-check-circle text-blue-400 text-xs"></i>
                          Performance metrics
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-plus-circle"></i>
                      Add Website
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Website List - Bottom */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-full blur-2xl"></div>
              
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-globe text-blue-500 text-sm"></i>
                  <h2 className="text-sm font-semibold text-gray-800">Your Websites</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  {websites.length} {websites.length === 1 ? 'website' : 'websites'}
                </span>
              </div>

              {fetching ? (
                <div className="p-8 text-center relative z-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600"></div>
                  <p className="text-xs text-gray-400 mt-2">Loading websites...</p>
                </div>
              ) : websites.length === 0 ? (
                <div className="p-8 text-center relative z-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <i className="fa-solid fa-globe text-gray-300 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-500">No websites added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first website above</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 relative z-10">
                  {websites.map((website) => (
                    <div
                      key={website._id || website.id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-link text-blue-500 text-xs"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {website.url}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <i className="fa-regular fa-calendar"></i>
                            Added: {formatDate(website.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(website)}
                        disabled={deleting === (website._id || website.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title="Delete website"
                      >
                        {deleting === (website._id || website.id) ? (
                          <svg className="animate-spin h-4 w-4 text-red-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <i className="fa-solid fa-trash-alt text-xs"></i>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && websiteToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-trash-alt text-white text-xl"></i>
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
                  <i className="fa-solid fa-trash-alt"></i>
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

export default AddWebsite;
