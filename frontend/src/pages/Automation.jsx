import React, { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const Automation = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [automationSettings, setAutomationSettings] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [stats, setStats] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchWebsites();
    fetchAutomationSettings();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      fetchLogs(selectedWebsite._id || selectedWebsite.id);
    }
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const response = await api.get("/websites");
      console.log("📋 Websites:", response.data);
      setWebsites(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedWebsite(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
      toast.error("Failed to load websites");
    }
  };

  const fetchAutomationSettings = async () => {
    try {
      console.log("📡 Fetching automation settings...");
      const response = await api.get("/automation/settings");
      console.log("📥 Settings response:", response.data);

      // ✅ Ensure we set the settings even if empty
      setAutomationSettings(response.data || {});

      // ✅ Log what we got
      console.log("📋 Settings keys:", Object.keys(response.data || {}));
      console.log(
        "📋 Settings count:",
        Object.keys(response.data || {}).length,
      );
    } catch (error) {
      console.error("Error fetching automation settings:", error);
      setAutomationSettings({});
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (websiteId) => {
    try {
      const response = await api.get(`/automation/logs/${websiteId}`);
      setLogs(response.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/automation/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    }
  };

  const updateSettings = (websiteId, settingType, value) => {
    setAutomationSettings((prev) => ({
      ...prev,
      [websiteId]: {
        ...prev[websiteId],
        [settingType]: value,
      },
    }));
  };

  const updateNotificationSettings = (websiteId, notificationType, value) => {
    setAutomationSettings((prev) => ({
      ...prev,
      [websiteId]: {
        ...prev[websiteId],
        notifications: {
          ...(prev[websiteId]?.notifications || {
            email: true,
            whatsapp: false,
            criticalOnly: true,
          }),
          [notificationType]: value,
        },
      },
    }));
  };

  const detectUserTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) return timezone;
    } catch (error) {
      console.log("Intl API failed:", error);
    }
    return "UTC";
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log("📤 Saving settings:", automationSettings);

      // ✅ Auto-detect timezone
      const userTimezone = detectUserTimezone();
      console.log("📍 User timezone:", userTimezone);

      // ✅ Add timezone to each setting
      const settingsWithTimezone = {};
      for (const [websiteId, setting] of Object.entries(automationSettings)) {
        settingsWithTimezone[websiteId] = {
          ...setting,
          timezone: userTimezone,
          scanTime: setting.scanTime || "09:00",
        };
      }

      const response = await api.post("/automation/settings", {
        settings: settingsWithTimezone,
      });

      console.log("📥 Save response:", response.data);

      toast.success("Automation settings saved successfully!");
      await fetchStats();
      await fetchAutomationSettings();
      if (selectedWebsite) {
        await fetchLogs(selectedWebsite._id || selectedWebsite.id);
      }
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAutomation = async (websiteId) => {
    setDeleteTarget(websiteId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/automation/settings/${deleteTarget}`);

      setAutomationSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[deleteTarget];
        return newSettings;
      });

      toast.success("Automation deleted successfully!");
      await fetchStats();
      await fetchAutomationSettings();

      if (
        selectedWebsite &&
        (selectedWebsite._id === deleteTarget ||
          selectedWebsite.id === deleteTarget)
      ) {
        const remainingWebsites = websites.filter(
          (w) => (w._id || w.id) !== deleteTarget,
        );
        if (remainingWebsites.length > 0) {
          setSelectedWebsite(remainingWebsites[0]);
        } else {
          setSelectedWebsite(null);
        }
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast.error("Failed to delete automation");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const testNotification = async (type) => {
    setTesting(true);
    try {
      const websiteId = selectedWebsite?._id || selectedWebsite?.id;
      const website = websites.find((w) => (w._id || w.id) === websiteId);

      await api.post("/automation/test-notification", {
        type,
        websiteUrl: website?.url,
      });
      toast.success(`Test ${type.toUpperCase()} sent!`);
    } catch (error) {
      console.error("Test notification failed:", error);
      toast.error(`Failed to send test ${type}`);
    } finally {
      setTesting(false);
    }
  };

  const getCurrentSettings = () => {
    if (!selectedWebsite) return {};
    const websiteId = selectedWebsite._id || selectedWebsite.id;
    return (
      automationSettings[websiteId] || {
        scanFrequency: "manual",
        notifications: { email: true, whatsapp: false, criticalOnly: true },
        isActive: false,
        nextScanAt: null,
      }
    );
  };

  // ✅ Get active automations with proper check
  const getActiveAutomations = () => {
    console.log("🔍 Getting active automations from:", automationSettings);
    const entries = Object.entries(automationSettings || {});
    console.log("📋 Entries:", entries);

    const active = entries
      .filter(([_, settings]) => {
        const isActive =
          settings.scanFrequency &&
          settings.scanFrequency !== "manual" &&
          settings.isActive !== false;
        console.log(`   ${settings.scanFrequency} -> isActive: ${isActive}`);
        return isActive;
      })
      .map(([websiteId, settings]) => {
        const website = websites.find((w) => (w._id || w.id) === websiteId);
        return {
          websiteId,
          websiteUrl: website?.url || "Unknown",
          ...settings,
        };
      });

    console.log("✅ Active automations:", active);
    return active;
  };

  const currentSettings = getCurrentSettings();
  const websiteId = selectedWebsite?._id || selectedWebsite?.id;
  const activeAutomations = getActiveAutomations();

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case "daily":
        return "Daily 9:00 AM";
      case "weekly":
        return "Weekly Monday 9:00 AM";
      case "monthly":
        return "Monthly 1st 9:00 AM";
      default:
        return "Manual";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading automation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
              <p className="text-sm text-gray-500">
                Configure automatic scans and notifications for your websites
              </p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <i className="fas fa-robot text-indigo-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalAutomations || 0}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Active</span>
                    <i className="fas fa-clock text-green-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {activeAutomations.length}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Success Rate</span>
                    <i className="fas fa-chart-line text-blue-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(stats.successRate || 0)}%
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Next Scan</span>
                    <i className="fas fa-calendar text-purple-500"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {activeAutomations.length > 0
                      ? formatDate(activeAutomations[0]?.nextScanAt)
                      : "None"}
                  </div>
                </div>
              </div>
            )}

            {/* Split Layout: Left = Saved Automations, Right = Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== LEFT SIDE: SAVED AUTOMATIONS ===== */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-0">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                          Saved Automations
                        </h2>
                        <p className="text-xs text-gray-500">
                          Configured schedules
                        </p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                        {activeAutomations.length}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 max-h-[500px] overflow-y-auto">
                    {/* ✅ Show a message if no automations */}
                    {activeAutomations.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fas fa-clock text-gray-300 text-xl"></i>
                        </div>
                        <p className="text-sm text-gray-500">
                          No automations configured
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Select a website and set up automation
                        </p>
                        <button
                          onClick={() => {
                            if (websites.length > 0) {
                              setSelectedWebsite(websites[0]);
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
                        >
                          + Add Automation
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeAutomations.map((auto) => (
                          <div
                            key={auto.websiteId}
                            onClick={() => {
                              const website = websites.find(
                                (w) => (w._id || w.id) === auto.websiteId,
                              );
                              if (website) setSelectedWebsite(website);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                              selectedWebsite?._id === auto.websiteId ||
                              selectedWebsite?.id === auto.websiteId
                                ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                                : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {auto.websiteUrl}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {getFrequencyLabel(auto.scanFrequency)}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      auto.notifications?.email
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-gray-100 text-gray-400"
                                    }`}
                                  >
                                    {auto.notifications?.email
                                      ? "📧 Email"
                                      : "🔇 No Email"}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAutomation(auto.websiteId);
                                }}
                                className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <i className="fas fa-trash-alt text-xs"></i>
                              </button>
                            </div>
                            {auto.nextScanAt && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <i className="fas fa-calendar"></i>
                                  Next: {formatDate(auto.nextScanAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT SIDE: CONFIGURATION FORM ===== */}
              <div className="lg:col-span-2">
                {selectedWebsite ? (
                  <div className="space-y-6">
                    {/* Website Selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-globe mr-2 text-indigo-500"></i>
                        Selected Website
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={websiteId || ""}
                        onChange={(e) => {
                          const website = websites.find(
                            (w) =>
                              (w._id || w.id).toString() === e.target.value,
                          );
                          setSelectedWebsite(website);
                        }}
                      >
                        {websites.map((website) => (
                          <option
                            key={website._id || website.id}
                            value={website._id || website.id}
                          >
                            {website.url}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scan Frequency */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-clock text-indigo-500 text-xl mr-3"></i>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Scan Frequency
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Choose how often to scan this website
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["daily", "weekly", "monthly", "manual"].map(
                          (freq) => (
                            <label
                              key={freq}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                currentSettings.scanFrequency === freq
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-200 hover:border-indigo-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="scanFrequency"
                                value={freq}
                                checked={currentSettings.scanFrequency === freq}
                                onChange={(e) =>
                                  updateSettings(
                                    websiteId,
                                    "scanFrequency",
                                    e.target.value,
                                  )
                                }
                                className="mr-3 text-indigo-600"
                              />
                              <div>
                                <div className="font-semibold text-sm capitalize">
                                  {freq}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {freq === "daily"
                                    ? "9:00 AM"
                                    : freq === "weekly"
                                      ? "Mon 9:00 AM"
                                      : freq === "monthly"
                                        ? "1st, 9:00 AM"
                                        : "No auto scans"}
                                </div>
                              </div>
                            </label>
                          ),
                        )}
                      </div>

                      {currentSettings.scanFrequency !== "manual" && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <i className="fas fa-clock"></i>
                            {currentSettings.scanFrequency === "daily" &&
                              "Daily scan scheduled at "}
                            {currentSettings.scanFrequency === "weekly" &&
                              "Weekly scan scheduled every Monday at "}
                            {currentSettings.scanFrequency === "monthly" &&
                              "Monthly scan scheduled on 1st at "}
                            <strong>9:00 AM</strong>
                            {currentSettings.nextScanAt && (
                              <span className="text-xs text-green-600 ml-2">
                                Next: {formatDate(currentSettings.nextScanAt)}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <div className="flex items-center">
                          <i className="fas fa-bell text-indigo-500 text-xl mr-3"></i>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Notifications
                          </h2>
                        </div>
                        {/* <div className="flex gap-2">
                          <button
                            onClick={() => testNotification("email")}
                            disabled={testing}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                          >
                            <i className="fas fa-envelope mr-1"></i>
                            <span className="hidden sm:inline">Test Email</span>
                          </button>
                        </div> */}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-envelope text-blue-500 text-xl mr-3"></i>
                            <div>
                              <div className="font-semibold text-sm">Email</div>
                              <div className="text-xs text-gray-500">
                                Receive alerts via email
                              </div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={
                                currentSettings.notifications?.email || false
                              }
                              onChange={(e) =>
                                updateNotificationSettings(
                                  websiteId,
                                  "email",
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-xl mr-3"></i>
                            <div>
                              <div className="font-semibold text-sm">
                                Critical Only
                              </div>
                              <div className="text-xs text-gray-500">
                                Only send alerts for critical issues
                              </div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={
                                currentSettings.notifications?.criticalOnly ||
                                false
                              }
                              onChange={(e) =>
                                updateNotificationSettings(
                                  websiteId,
                                  "criticalOnly",
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={saveSettings}
                      disabled={saving}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Automation Settings
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-globe text-gray-300 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      No Website Selected
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Please select a website from the left panel to configure
                      automation
                    </p>
                    {websites.length > 0 && (
                      <button
                        onClick={() => setSelectedWebsite(websites[0])}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        Select First Website
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scan Logs - Full Width */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-history text-indigo-500 text-xl mr-3"></i>
                <h2 className="text-lg font-semibold text-gray-900">
                  Scan Logs
                </h2>
                <span className="ml-auto text-xs text-gray-400">
                  {logs.length} records
                </span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-inbox text-gray-300 text-3xl mb-2"></i>
                  <p className="text-sm text-gray-500">No scan logs yet</p>
                  <p className="text-xs text-gray-400">
                    Scans will appear here once they run
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-green-500" : log.status === "running" ? "bg-yellow-500" : "bg-red-500"}`}
                        ></span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.status === "success"
                              ? "Scan Completed"
                              : log.status === "running"
                                ? "Scanning..."
                                : "Scan Failed"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.issuesFound || 0} issues •{" "}
                            {log.criticalIssues || 0} critical
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(log.status)}`}
                        >
                          {log.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Automation?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                This will stop automated scans for this website. You can
                re-enable it anytime.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automation;
