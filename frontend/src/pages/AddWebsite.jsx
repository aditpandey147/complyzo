import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL;

const AddWebsite = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/websites`, 
        { url },
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Website added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] overflow-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">Add Website</h1>
              <p className="text-xs text-gray-500 mt-0.5">Enter a website URL to start monitoring</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Include http:// or https:// for best results
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2.5">
                    <i className="fa-solid fa-circle-info text-blue-500 text-sm mt-0.5"></i>
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1.5">What we'll monitor:</p>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-1.5">
                          <i className="fa-solid fa-check text-blue-400 text-[10px]"></i>
                          SEO elements (titles, descriptions, headings)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <i className="fa-solid fa-check text-blue-400 text-[10px]"></i>
                          Security features (HTTPS, headers)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <i className="fa-solid fa-check text-blue-400 text-[10px]"></i>
                          Compliance (cookies, policies)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <i className="fa-solid fa-check text-blue-400 text-[10px]"></i>
                          Performance metrics
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'Add Website'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddWebsite;
