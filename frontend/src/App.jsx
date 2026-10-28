import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import { getStoredUser, getMe, logout as apiLogout } from "./api";

// Code splitting with React.lazy (Practical 8)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Projects = lazy(() => import("./pages/Projects"));
const ActivityEvents = lazy(() => import("./pages/ActivityEvents"));
const Account = lazy(() => import("./pages/Account"));
const Health = lazy(() => import("./pages/Health"));
const PerformanceLab = lazy(() => import("./pages/PerformanceLab"));

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [toasts, setToasts] = useState([]);

  // Hydrate user session from stored JWT
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const profile = await getMe();
        if (profile) setUser(profile);
      } catch {
        setUser(null);
      }
    };
    hydrateSession();

    // Listen for global auth logout event (e.g. 401 response)
    const handleAuthLogout = () => {
      setUser(null);
    };
    window.addEventListener("taskflow_auth_logout", handleAuthLogout);
    return () => window.removeEventListener("taskflow_auth_logout", handleAuthLogout);
  }, []);

  const showToast = useCallback((message, type = "info") => {
    if (!message) return;
    setToasts((prev) => {
      // Prevent stacking of identical toasts
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      const id = Date.now() + Math.random();
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3500);
      return [...prev, { id, message, type }];
    });
  }, []);

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    showToast("Signed out successfully.", "info");
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        <Suspense fallback={<Spinner label="Loading page..." />}>
          <Routes>
            <Route
              path="/"
              element={<Dashboard user={user} onToast={showToast} />}
            />
            <Route
              path="/tasks"
              element={
                <Tasks
                  user={user}
                  onAuthSuccess={handleAuthSuccess}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/projects"
              element={<Projects />}
            />
            <Route
              path="/activity"
              element={
                <ActivityEvents
                  user={user}
                  onAuthSuccess={handleAuthSuccess}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/account"
              element={
                <Account
                  user={user}
                  onAuthSuccess={handleAuthSuccess}
                  onLogout={handleLogout}
                  onToast={showToast}
                />
              }
            />
            <Route
              path="/health"
              element={<Health />}
            />
            <Route
              path="/performance-lab"
              element={<PerformanceLab onToast={showToast} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}</span>
              <div style={{ flex: 1 }}>{toast.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
