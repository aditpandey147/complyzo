// pages/CompetitorAnalysis.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

const CompetitorAnalysis = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userUrl, setUserUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '']);
  const [results, setResults] = useState(null);

  const handleCompetitorChange = (index, value) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const addCompetitor = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, '']);
    } else {
      toast.info('Maximum 5 competitors allowed');
    }
  };

  const removeCompetitor = (index) => {
    if (competitorUrls.length <= 1) return;
    const newUrls = competitorUrls.filter((_, i) => i !== index);
    setCompetitorUrls(newUrls);
  };

  const handleAnalyze = async () => {
    if (!userUrl) {
      toast.error('Please enter your website URL');
      return;
    }

    const validCompetitors = competitorUrls.filter(url => url.trim() !== '');
    if (validCompetitors.length === 0) {
      toast.error('Please enter at least one competitor URL');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/competitor/analyze', {
        userUrl: userUrl.trim(),
        competitorUrls: validCompetitors.map(url => url.trim())
      });

      if (response.data.success) {
        setResults(response.data.data);
        toast.success('Analysis completed successfully!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze competitors');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Circular Progress Component
  const CircularProgress = ({ value, label, color, size = 80, strokeWidth = 6, showPercentage = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(Math.max(value, 0), 100);
    const dashOffset = circumference - (progress / 100) * circumference;
    
    const colors = {
      blue: { stroke: '#3b82f6', bg: '#dbeafe', text: 'text-blue-600' },
      green: { stroke: '#22c55e', bg: '#dcfce7', text: 'text-green-600' },
      purple: { stroke: '#8b5cf6', bg: '#ede9fe', text: 'text-purple-600' },
      red: { stroke: '#ef4444', bg: '#fee2e2', text: 'text-red-600' },
      orange: { stroke: '#f59e0b', bg: '#fef3c7', text: 'text-orange-600' },
      emerald: { stroke: '#10b981', bg: '#d1fae5', text: 'text-emerald-600' },
      pink: { stroke: '#ec4899', bg: '#fce7f3', text: 'text-pink-600' },
      indigo: { stroke: '#6366f1', bg: '#e0e7ff', text: 'text-indigo-600' },
    };
    
    const colorStyle = colors[color] || colors.blue;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorStyle.bg}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorStyle.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${colorStyle.text}`}>{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-gray-600 mt-1.5 text-center">{label}</span>
      </div>
    );
  };

  // ✅ Metric Card with Circular Progress
  const MetricCard = ({ label, userScore, competitorAvg, difference, color, icon }) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      purple: 'text-purple-600 bg-purple-50',
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      orange: 'text-orange-600 bg-orange-50',
      emerald: 'text-emerald-600 bg-emerald-50',
      pink: 'text-pink-600 bg-pink-50',
      indigo: 'text-indigo-600 bg-indigo-50',
    };
    
    const colorClass = colors[color] || colors.blue;
    const isPositive = difference >= 0;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100/80 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
            <i className={`fas ${icon} text-lg`}></i>
          </div>
          <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
        </div>
        
        <div className="flex items-center justify-around gap-4">
          <div className="text-center">
            <CircularProgress 
              value={userScore} 
              label="You" 
              color={color}
              size={70}
              strokeWidth={5}
            />
          </div>
          
          <div className="text-center">
            <CircularProgress 
              value={competitorAvg} 
              label="Competitor Avg" 
              color="purple"
              size={70}
              strokeWidth={5}
            />
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{difference}
              <span className="text-xs ml-0.5">%</span>
            </div>
            <div className="text-[10px] text-gray-400">Difference</div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ All Scores in Circular Progress
  const AllScoresCircular = ({ user, competitors }) => {
    const metrics = [
      { key: 'seoScore', label: 'SEO Score', color: 'blue', icon: 'fa-search' },
      { key: 'securityScore', label: 'Security Score', color: 'green', icon: 'fa-shield' },
      { key: 'performanceScore', label: 'Performance Score', color: 'orange', icon: 'fa-tachometer-alt' },
      { key: 'contentScore', label: 'Content Score', color: 'purple', icon: 'fa-file-alt' },
    ];

    const getCompetitorAvg = (metricKey) => {
      const scores = competitors.map(c => c?.[metricKey] || 0);
      return Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">All Scores Overview</h3>
            <p className="text-sm text-gray-400">Complete comparison across all metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const userScore = user[metric.key] || 0;
            const compAvg = getCompetitorAvg(metric.key);
            const diff = userScore - compAvg;
            
            return (
              <MetricCard
                key={metric.key}
                label={metric.label}
                userScore={userScore}
                competitorAvg={compAvg}
                difference={diff}
                color={metric.color}
                icon={metric.icon}
              />
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-600">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-gray-600">Competitor Average</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">You're Ahead</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">Need Improvement</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ SEO Score Row with Circular Progress
  const ScoreRow = ({ userScore, competitors }) => {
    const allScores = [
      { label: 'Your Site', score: userScore, color: 'blue' },
      ...competitors.map((comp, i) => ({
        label: `Comp ${i + 1}`,
        score: comp?.seoScore || 0,
        color: ['purple', 'green', 'orange', 'red', 'emerald'][i] || 'purple'
      }))
    ];

    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">SEO Score Comparison</h3>
            <p className="text-sm text-gray-400">Compare your SEO performance against competitors</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-around items-center gap-4 md:gap-8">
          {allScores.map((item, index) => (
            <CircularProgress
              key={index}
              value={item.score}
              label={item.label}
              color={item.color}
              size={index === 0 ? 100 : 80}
              strokeWidth={index === 0 ? 8 : 6}
            />
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Your Site: <strong className="text-gray-700">{userScore}%</strong>
          </div>
          {competitors.map((comp, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full bg-${['purple', 'green', 'orange', 'red', 'emerald'][i]}-500`}></span>
              Comp {i + 1}: <strong className="text-gray-700">{comp?.seoScore || 0}%</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ Score Bar Component
  const ScoreBar = ({ label, userScore, competitorAvg, difference, best }) => {
    const color = difference >= 0 ? 'text-emerald-600' : 'text-red-600';
    const barColor = difference >= 0 ? 'bg-emerald-500' : 'bg-red-500';
    const diffIcon = difference >= 0 ? '↑' : '↓';
    
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-5 border border-gray-200/80 hover:shadow-md transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
            {label}
          </h4>
          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">You</span>
              <span className="text-sm font-bold text-blue-600">{userScore}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Avg</span>
              <span className="text-sm font-bold text-purple-600">{competitorAvg}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className={`flex items-center gap-1 text-sm font-bold ${color}`}>
              <span>{diffIcon}</span>
              <span>{Math.abs(difference)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(userScore, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000 ease-out delay-300"
                style={{ width: `${Math.min(competitorAvg, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white/90 tracking-wider">COMPETITOR AVG</span>
              </div>
            </div>
          </div>
        </div>
        
        {best && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">🏆 Best:</span>
            <span className="text-[10px] font-medium text-gray-600 truncate">
              {new URL(best.name).hostname}
            </span>
            <span className="text-[10px] text-gray-400">({best.score})</span>
          </div>
        )}
      </div>
    );
  };

  // ✅ Insights Component
  const InsightsSection = ({ insights }) => {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">💡 Insights & Recommendations</h3>
            <p className="text-sm text-gray-400">Actionable tips to improve your performance</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const config = {
              critical: { border: 'border-red-200', bg: 'bg-red-50/50', icon: '🚨', badge: 'bg-red-100 text-red-700' },
              warning: { border: 'border-yellow-200', bg: 'bg-yellow-50/50', icon: '⚠️', badge: 'bg-yellow-100 text-yellow-700' },
              info: { border: 'border-blue-200', bg: 'bg-blue-50/50', icon: '💡', badge: 'bg-blue-100 text-blue-700' },
            };
            const style = config[insight.type] || config.info;
            
            return (
              <div
                key={index}
                className={`p-5 rounded-xl border ${style.border} ${style.bg} hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${style.badge}`}>
                        {insight.area}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{insight.type}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.message}</p>
                    <p className="text-sm text-blue-600 mt-2 font-medium flex items-center gap-1.5">
                      <i className="fas fa-lightbulb text-xs"></i>
                      {insight.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ✅ Details Table Component
  const DetailsTable = ({ user, competitors }) => {
    const metrics = [
      { key: 'seoScore', label: 'SEO Score' },
      { key: 'securityScore', label: 'Security Score' },
      { key: 'performanceScore', label: 'Performance Score' },
      { key: 'contentScore', label: 'Content Score' },
      { key: 'wordCount', label: 'Word Count' },
      { key: 'h1Count', label: 'H1 Tags' },
      { key: 'h2Count', label: 'H2 Tags' },
      { key: 'imageCount', label: 'Images' },
      { key: 'internalLinks', label: 'Internal Links' },
      { key: 'externalLinks', label: 'External Links' },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">📋 Detailed Comparison</h3>
            <p className="text-sm text-gray-400">Complete breakdown of all metrics</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Metric</th>
                <th className="text-center px-4 py-3.5 font-semibold text-blue-600">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Your Site
                  </div>
                </th>
                {competitors.map((comp, i) => (
                  <th key={i} className="text-center px-4 py-3.5 font-semibold text-purple-600">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Comp {i + 1}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.map((metric) => (
                <tr key={metric.key} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-medium">{metric.label}</td>
                  <td className="text-center px-4 py-3 font-bold text-blue-600">
                    {user[metric.key] || 0}
                  </td>
                  {competitors.map((comp, i) => (
                    <td key={i} className="text-center px-4 py-3 text-gray-700">
                      {comp[metric.key] !== undefined ? comp[metric.key] : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
                  <p className="text-gray-500 mt-0.5">Compare your website against competitors and find opportunities</p>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80 mb-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Enter Websites</h2>
                  <p className="text-sm text-gray-400">Add your website and competitors in one row</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-link text-blue-500"></i>
                    </div>
                    <input
                      type="url"
                      value={userUrl}
                      onChange={(e) => setUserUrl(e.target.value)}
                      placeholder="Your Website"
                      className="w-full pl-9 pr-3 py-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="text-gray-400 text-xs font-bold px-1">VS</div>

                {competitorUrls.map((url, index) => (
                  <div key={index} className="flex-1 min-w-[150px] relative">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className={`fas fa-flag text-${['purple', 'green', 'orange', 'red', 'emerald'][index]}-500`}></i>
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleCompetitorChange(index, e.target.value)}
                        placeholder={`Comp ${index + 1}`}
                        className="w-full pl-9 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                      {competitorUrls.length > 1 && (
                        <button
                          onClick={() => removeCompetitor(index)}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-300 hover:text-red-500 transition"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {competitorUrls.length < 5 && (
                  <button
                    onClick={addCompetitor}
                    className="px-3 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all duration-200 flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                  >
                    <i className="fas fa-plus-circle"></i>
                    Add
                  </button>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket"></i>
                      Analyze
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Your Site
                </span>
                {competitorUrls.map((_, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${['purple', 'green', 'orange', 'red', 'emerald'][i]}-500`}></span>
                    Comp {i + 1}
                  </span>
                ))}
                <span className="ml-auto text-gray-300">| Add up to 5 competitors</span>
              </div>
            </div>

            {/* Results Section */}
            {results && (
              <div className="animate-fade-in">
                {/* SEO Score Row */}
                <ScoreRow 
                  userScore={results.user.seoScore} 
                  competitors={results.competitors} 
                />

                {/* All Scores in Circular Progress */}
                <AllScoresCircular 
                  user={results.user} 
                  competitors={results.competitors} 
                />

                {/* Scores Bars */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100/80 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">🏆 Score Comparison</h3>
                      <p className="text-sm text-gray-400">Detailed comparison with competitor average</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ScoreBar
                      label="SEO Score"
                      userScore={results.user.seoScore}
                      competitorAvg={results.comparison.scores.seo.competitorAvg}
                      difference={results.comparison.scores.seo.difference}
                      best={results.comparison.scores.seo.best}
                    />
                    <ScoreBar
                      label="Security Score"
                      userScore={results.user.securityScore}
                      competitorAvg={results.comparison.scores.security.competitorAvg}
                      difference={results.comparison.scores.security.difference}
                      best={results.comparison.scores.security.best}
                    />
                    <ScoreBar
                      label="Performance Score"
                      userScore={results.user.performanceScore}
                      competitorAvg={results.comparison.scores.performance.competitorAvg}
                      difference={results.comparison.scores.performance.difference}
                      best={results.comparison.scores.performance.best}
                    />
                    <ScoreBar
                      label="Content Score"
                      userScore={results.user.contentScore}
                      competitorAvg={results.comparison.scores.content.competitorAvg}
                      difference={results.comparison.scores.content.difference}
                      best={results.comparison.scores.content.best}
                    />
                  </div>
                </div>

                {/* Insights Section */}
                <InsightsSection insights={results.comparison.insights} />

                {/* Details Table */}
                <DetailsTable 
                  user={results.user} 
                  competitors={results.competitors} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CompetitorAnalysis;