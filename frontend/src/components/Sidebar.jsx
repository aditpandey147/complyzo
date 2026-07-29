import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../assets/nav-logo.png"

const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [planName, setPlanName] = useState(user?.planName || "Free");
  const [planLoading, setPlanLoading] = useState(false);

  // ✅ Fetch plan name from Plan table based on planId
  useEffect(() => {
    const fetchPlanName = async () => {
      if (!user?.planId) return;

      try {
        setPlanLoading(true);
        const response = await api.get("/plans");
        if (response.data && response.data.length > 0) {
          const plan = response.data.find((p) => p.planId === user.planId);
          if (plan) {
            setPlanName(plan.name);
          } else {
            setPlanName(user?.planName || "Free");
          }
        }
      } catch (error) {
        console.error("Failed to fetch plan name:", error);
        setPlanName(user?.planName || "Free");
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlanName();
  }, [user?.planId]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { path: "/insights", label: "Insights", icon: "fa-chart-pie" },
    { path: "/zo/ai/chat", label: "ZO AI", icon: "fa-robot" },
    { path: "/automation", label: "Automation", icon: "fa-clock" },
    { path: "/add-website", label: "Add Website", icon: "fa-plus-circle" },
    { path: "/reports", label: "Reports", icon: "fa-file-alt" },
    { path: "/settings", label: "Settings", icon: "fa-cog" },
    {
      path: "/ai-profit-machine",
      label: "AI Profit Machine",
      icon: "fa-money-bill-wave",
    },
    {
      path: "/visual-library",
      label: "DFY Visual Library",
      icon: "fa-images",
    },
    {
      path: "/video-library",
      label: "DFY Video Library",
      icon: "fa-video",
    },
    { path: '/ai-ranker', icon: 'fa-chart-line', label: 'AI Ranker' },
  ];

  const adminNavItem = {
    path: "/admin/dashboard",
    label: "Admin Panel",
    icon: "fa-shield-alt",
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getPlanColor = (planName) => {
    const planColors = {
      Free: "bg-gray-100 text-gray-600",
      Starter: "bg-blue-100 text-blue-600",
      Pro: "bg-purple-100 text-purple-600",
      Growth: "bg-green-100 text-green-600",
      Enterprise: "bg-amber-100 text-amber-600",
      "Healtrics FE": "bg-blue-100 text-blue-600",
      "Healtrics Pro": "bg-purple-100 text-purple-600",
      "Healtrics Unlimited": "bg-amber-100 text-amber-600",
      Healtric: "bg-blue-100 text-blue-600",
    };
    return planColors[planName] || "bg-gray-100 text-gray-600";
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      Free: "fa-box",
      Starter: "fa-rocket",
      Pro: "fa-crown",
      Growth: "fa-chart-line",
      Enterprise: "fa-building",
      "Healtrics FE": "fa-box",
      "Healtrics Pro": "fa-crown",
      "Healtrics Unlimited": "fa-infinity",
      Healtric: "fa-box",
    };
    return planIcons[planName] || "fa-box";
  };

  // ✅ Helper function to get styles based on active state
  const getNavLinkClass = (isActive) => {
    return `group relative flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 text-indigo-600 shadow-sm" 
        : "text-gray-600 hover:bg-gray-50/80 hover:text-indigo-500"
    }`;
  };

  const getIconClass = (isActive) => {
    return `w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600" 
        : "bg-gray-100/80 text-gray-400 group-hover:bg-indigo-50/50 group-hover:text-indigo-500"
    }`;
  };

  const getAdminNavLinkClass = (isActive) => {
    return `group relative flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-red-50 to-red-100/50 text-red-600 shadow-sm" 
        : "text-gray-600 hover:bg-red-50/50 hover:text-red-500"
    }`;
  };

  const getAdminIconClass = (isActive) => {
    return `w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
      isActive 
        ? "bg-red-100 text-red-600" 
        : "bg-gray-100/80 text-gray-400 group-hover:bg-red-100/50 group-hover:text-red-500"
    }`;
  };

  return (
    <>
      {/* Desktop Sidebar - Enhanced UI */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white shadow-2xl h-screen fixed left-0 top-0 border-r border-gray-100/80">
        
        {/* Logo Section - Premium */}
        <div className="p-5 border-b border-gray-100/80 flex justify-center">
          <Link to="/" className="inline-block group w-[13rem]">
            <img src={logo} alt="" src="complyzo by albinolabs" />
          </Link>
          {user?.role === "admin" && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Admin
            </span>
          )}
        </div>

        {/* Navigation Links - Premium */}
        <nav className="flex-1 mt-3 px-3 overflow-y-auto">
          {/* Admin Panel Link */}
          {user?.role === "admin" && (
            <div className="mb-3">
              <div className="px-3 py-1.5">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-px bg-gray-300"></span>
                  Administration
                  <span className="w-4 h-px bg-gray-300"></span>
                </span>
              </div>
              <NavLink
                to={adminNavItem.path}
                className={({ isActive }) => getAdminNavLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <div className={getAdminIconClass(isActive)}>
                      <i className={`fas ${adminNavItem.icon} text-sm`}></i>
                    </div>
                    <span className="ml-3 text-base font-medium">{adminNavItem.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )}

          {/* Divider */}
          {user?.role === "admin" && (
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/60"></div>
              </div>
            </div>
          )}

          {/* Main Navigation - Enhanced */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <div className={getIconClass(isActive)}>
                      <i className={`fas ${item.icon} text-sm`}></i>
                    </div>
                    <span className="ml-3 text-base font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-r-full"></span>
                    )}
                    {item.badge && (
                      <span className={`ml-auto text-[8px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Info - Premium Footer */}
        <div className="p-4 mt-auto border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/50">
          {user && (
            <div className="relative mb-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100/80">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl"></div>
              
              <div className="relative flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Plan Badge */}
              <div className="relative mt-3 flex items-center gap-2">
                {planLoading ? (
                  <span className="text-[10px] text-gray-400">Loading plan...</span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full ${getPlanColor(planName)}`}>
                    <i className={`fas ${getPlanIcon(planName)} text-[8px]`}></i>
                    {planName}
                  </span>
                )}
                {user?.role === "admin" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Admin
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Logout Button - Premium */}
          <button
            onClick={handleLogout}
            className="group relative w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200/80 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <i className="fas fa-sign-out-alt text-sm transition-transform duration-300 group-hover:rotate-12"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Enhanced */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/80 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "text-indigo-600 bg-indigo-50/80" 
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <i className={`fas ${item.icon} text-lg`}></i>
              <span className="text-[9px] font-medium mt-0.5">{item.label.split(" ")[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
