import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AIProfitProvider } from "./context/AIProfitContext";
import PrivateRoute from "./components/PrivateRoute";
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

//Pages
import Dashboard from "./pages/Dashboard";
import AddWebsite from "./pages/AddWebsite";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AIFixer from "./pages/zo";
import Automation from "./pages/Automation";
import Insights from "./pages/Insights";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";

//Admin
import AdminDashboard from "./pages/admin/Dashboard";

//oto's//
import Unlimited from "./pages/Unlimited";
import AIProfitMachine from "./pages/profit/AIProfitMachine";
import AIProfitChat from "./pages/profit/AIProfitChat";
import AIRanker from "./pages/ranker/AIRanker";
import AIRankerChat from "./pages/ranker/AIRankerChat";

// DFY - Visual Library
import VisualLibraryPage from "./components/dfy/VisualLibraryPage";
import VideoLibraryPage from "./components/dfy/VideoLibraryPage";

//Support
import Training from "./pages/support/Training";
import Support from "./pages/support/Support";

// ✅ Layout component
const Layout = ({ children }) => {
  const location = useLocation();

  // Pages that should NOT show HomeNavbar and Footer
  const dashboardPages = [
    "/dashboard",
    "/add-website",
    "/reports",
    "/settings",
    "/zo/ai/chat",
    "/automation",
    "/insights",
    "/admin/dashboard",
    "/ai-profit-machine",
    "/visual-library",
    "/video-library",
    "/ai-ranker",
    "/unlimited",
    "/training",
    "/support",
    "/competitor-analysis",
  ];

  // Check if current path is a dashboard page
  const isDashboardPage =
    dashboardPages.includes(location.pathname) ||
    location.pathname.startsWith("/ai-profit-machine/chat/") ||
    location.pathname.startsWith("/ai-ranker/chat/");

  // Pages that should NOT show any navbar
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {/* ✅ Show HomeNavbar only on public pages (not dashboard, not auth) */}
      {!isDashboardPage && !isAuthPage && <HomeNavbar />}
      <div className={!isDashboardPage && !isAuthPage ? "pt-14" : ""}>
        {children}
      </div>
      {/* ✅ Show Footer only on public pages (not dashboard, not auth) */}
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AIProfitProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            {/* ✅ REDIRECT root (/) to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-website"
              element={
                <PrivateRoute>
                  <AddWebsite />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />

            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <Unlimited />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-ranker"
              element={
                <PrivateRoute>
                  <AIRanker />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-ranker/chat/:chatId"
              element={
                <PrivateRoute>
                  <AIRankerChat />
                </PrivateRoute>
              }
            />
            <Route
              path="/zo/ai/chat"
              element={
                <PrivateRoute>
                  <AIFixer />
                </PrivateRoute>
              }
            />
            <Route
              path="/automation"
              element={
                <PrivateRoute>
                  <Automation />
                </PrivateRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <PrivateRoute>
                  <Insights />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-profit-machine"
              element={
                <PrivateRoute>
                  <AIProfitMachine />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-profit-machine/chat/:chatId"
              element={
                <PrivateRoute>
                  <AIProfitChat />
                </PrivateRoute>
              }
            />

            {/* ✅ DFY Visual Library Route */}
            <Route
              path="/visual-library"
              element={
                <PrivateRoute>
                  <VisualLibraryPage
                    apiKey={
                      import.meta.env.VITE_PEXELS_API_KEY ||
                      "YOUR_PIXABAY_API_KEY"
                    }
                    defaultQuery="Technology"
                    perPage={12}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/video-library"
              element={
                <PrivateRoute>
                  <VideoLibraryPage
                    apiKey={
                      import.meta.env.VITE_PEXELS_API_KEY ||
                      "YOUR_PEXELS_API_KEY"
                    }
                    defaultQuery="Technology"
                    perPage={12}
                  />
                </PrivateRoute>
              }
            />

            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitor-analysis"
              element={
                <PrivateRoute>
                  <CompetitorAnalysis />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AIProfitProvider>
    </AuthProvider>
  );
}

export default App;
