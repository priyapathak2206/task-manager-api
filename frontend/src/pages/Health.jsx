import React, { useState, useEffect } from "react";
import { getHealth } from "../api";
import MetricCard from "../components/MetricCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Health() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.message || "Failed to reach backend health endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Diagnostics</h1>
          <p className="page-subtitle">
            Real-time diagnostics for server runtime, database connection, and memory consumption.
          </p>
        </div>
        <button onClick={fetchHealth} disabled={loading} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} onRetry={fetchHealth} />

      {loading && !healthData ? (
        <Spinner label="Checking system status..." />
      ) : healthData ? (
        <div>
          {/* Top Status Cards */}
          <div className="grid-4">
            <MetricCard
              title="System Status"
              value={healthData.status === "healthy" ? "Healthy" : "Degraded"}
              badge={healthData.environment || "production"}
              subtext="Express REST API active"
              color="#34d399"
            />

            <MetricCard
              title="Server Uptime"
              value={formatUptime(healthData.uptimeSeconds)}
              badge="Online"
              subtext={`Started ${healthData.uptimeSeconds}s ago`}
              color="#67e8f9"
            />

            <MetricCard
              title="Database"
              value={healthData.database?.status === "connected" ? "Connected" : "Disconnected"}
              badge={healthData.database?.name || "Atlas"}
              subtext="MongoDB Atlas Persistent Store"
              color={healthData.database?.status === "connected" ? "#34d399" : "#f87171"}
            />

            <MetricCard
              title="Memory Consumption"
              value={`${healthData.memory?.heapUsedMB || 0} MB`}
              badge={`Total: ${healthData.memory?.heapTotalMB || 0} MB`}
              subtext={`RSS: ${healthData.memory?.rssMB || 0} MB`}
              color="#a5b4fc"
            />
          </div>

          {/* System Diagnostics Table */}
          <div className="card">
            <div className="card-title">
              <span>Server Diagnostics & Runtime</span>
              <span className="badge badge-primary">GET /health</span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: "220px" }}>Application Name</td>
                    <td>{healthData.application}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>API Version</td>
                    <td>{healthData.version}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Server Timestamp</td>
                    <td><code>{healthData.timestamp}</code></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Database Connection State</td>
                    <td>
                      <span className="badge badge-success">
                        ReadyState {healthData.database?.readyState} (Connected)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Cache Engine</td>
                    <td>
                      {healthData.cache?.cachedKeysCount ?? 0} keys in memory • {healthData.cache?.hits ?? 0} hits • {healthData.cache?.misses ?? 0} misses • Hit ratio: {healthData.cache?.hitRatio || "0.0%"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* API Endpoints Catalog */}
          <div className="card">
            <div className="card-title">
              <span>RESTful API Route Registry</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint Path</th>
                    <th>Access</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-success">GET</span></td>
                    <td><code>/health</code></td>
                    <td>Public</td>
                    <td>Returns server health, uptime, database state, and memory metrics</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">POST</span></td>
                    <td><code>/auth/register</code></td>
                    <td>Public</td>
                    <td>Registers user with Bcrypt password hashing</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">POST</span></td>
                    <td><code>/auth/login</code></td>
                    <td>Public</td>
                    <td>Authenticates credentials and signs a 1-hour JWT token</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-success">GET</span></td>
                    <td><code>/auth/me</code></td>
                    <td>Private</td>
                    <td>Retrieves authenticated user profile by JWT token</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-success">GET</span></td>
                    <td><code>/tasks</code></td>
                    <td>Private</td>
                    <td>Fetches tasks with 60s TTL cache (returns X-Cache header)</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">POST</span></td>
                    <td><code>/tasks</code></td>
                    <td>Private</td>
                    <td>Creates task, invalidates cache, and emits task-created event</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-warning">PUT</span></td>
                    <td><code>/tasks/:id</code></td>
                    <td>Private</td>
                    <td>Updates task ownership-checked by user ID and invalidates cache</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-danger">DELETE</span></td>
                    <td><code>/tasks/:id</code></td>
                    <td>Private</td>
                    <td>Deletes task, invalidates cache, and emits deleted notification</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-success">GET</span></td>
                    <td><code>/tasks/cache-stats</code></td>
                    <td>Private</td>
                    <td>Returns live cache hit/miss metrics and key counts</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">POST</span></td>
                    <td><code>/tasks/cache-clear</code></td>
                    <td>Private</td>
                    <td>Invalidates user task cache key</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">POST</span></td>
                    <td><code>/api/ai/generate-description</code></td>
                    <td>Private</td>
                    <td>Generates description with rate limit and safety disclaimer</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-success">GET</span></td>
                    <td><code>/api/events</code></td>
                    <td>Private</td>
                    <td>Returns asynchronous notification timestamps and statuses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Health;
