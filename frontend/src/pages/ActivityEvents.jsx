import React, { useState, useEffect, useCallback, useRef } from "react";
import { getEvents } from "../api";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import AuthPrompt from "../components/AuthPrompt";

function ActivityEvents({ user, onAuthSuccess, onToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Track component mount status to avoid state updates on unmounted component
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Core fetch function
  const fetchEvents = useCallback(async (isInitial = false, isManual = false) => {
    if (!user) {
      if (isMountedRef.current) setLoading(false);
      return;
    }

    try {
      if (isInitial) {
        setLoading(true);
      } else if (isManual) {
        setRefreshing(true);
      }

      setError(null);
      const data = await getEvents();

      if (isMountedRef.current) {
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to load activity events.");
        if (isManual) {
          onToast?.(err.message || "Failed to refresh activity.", "error");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user, onToast]);

  // Initial load on mount or user change only (no automatic polling)
  useEffect(() => {
    if (user) {
      fetchEvents(true, false);
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user, fetchEvents]);

  // Handle explicit manual refresh button click
  const handleManualRefresh = () => {
    fetchEvents(false, true);
  };

  if (!user) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Activity</h1>
            <p className="page-subtitle">
              Sign in to view real-time task notifications and event logs.
            </p>
          </div>
        </div>

        <AuthPrompt onAuthSuccess={onAuthSuccess} onToast={onToast} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity</h1>
          <p className="page-subtitle">
            Log of asynchronous task events and background processing.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="btn btn-sm btn-secondary"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Clear error message with retry button if API fails */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchEvents(true, true)}
        />
      )}

      {loading ? (
        <Spinner label="Loading activity events..." />
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📡</div>
          <p className="empty-state-title" style={{ marginBottom: "0.25rem" }}>
            No activity events recorded yet
          </p>
          <p className="empty-state-desc" style={{ maxWidth: "420px", margin: "0 auto 1.25rem" }}>
            When tasks are created or deleted, background event notifications will appear here.
          </p>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="btn btn-sm btn-secondary"
          >
            Check for Updates
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              className="card"
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                borderLeft: evt.status === "completed" ? "4px solid var(--success)" : "4px solid var(--warning)",
              }}
            >
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {evt.taskTitle || "Task"}
                  </span>
                  <span
                    className={`badge ${
                      evt.type === "task-created" ? "badge-primary" : "badge-danger"
                    }`}
                  >
                    {evt.type === "task-created" ? "Created" : "Deleted"}
                  </span>
                </div>

                <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                  <span>
                    API Timestamp: {evt.apiTimestamp ? new Date(evt.apiTimestamp).toLocaleTimeString() : "N/A"}
                  </span>
                  {evt.eventReceivedTimestamp && (
                    <span>
                      Triggered: {new Date(evt.eventReceivedTimestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {evt.durationMs && (
                    <span>Duration: {evt.durationMs}ms</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  className={`badge ${
                    evt.status === "completed"
                      ? "badge-success"
                      : evt.status === "processing"
                      ? "badge-warning"
                      : "badge-subtle"
                  }`}
                >
                  {evt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityEvents;
