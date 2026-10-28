import React, { useState, useEffect } from "react";
import { getTasks, getCacheStats, clearCache } from "../api";
import MetricCard from "../components/MetricCard";
import ErrorMessage from "../components/ErrorMessage";

function PerformanceLab({ onToast }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Benchmark states
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [lastColdMs, setLastColdMs] = useState(null);
  const [lastWarmMs, setLastWarmMs] = useState(null);
  const [history, setHistory] = useState([]);

  const refreshStats = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const data = await getCacheStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load cache statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Run Cold Cache Query (Cache Miss / Database Roundtrip)
  const runColdQuery = async () => {
    try {
      setRunningBenchmark(true);
      const res = await getTasks({ noCache: true });
      const duration = res.durationMs || 1;
      setLastColdMs(duration);

      const entry = {
        id: Date.now(),
        type: "Cold Query (DB Miss)",
        status: "MISS",
        durationMs: duration,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory((prev) => [entry, ...prev.slice(0, 9)]);
      await refreshStats();
      onToast?.(`Cold DB query completed in ${duration}ms (Cache Miss)`, "info");
    } catch (err) {
      onToast?.(err.message || "Cold query failed", "error");
    } finally {
      setRunningBenchmark(false);
    }
  };

  // Run Warm Cache Query (Cache Hit / In-Memory Roundtrip)
  const runWarmQuery = async () => {
    try {
      setRunningBenchmark(true);
      const res = await getTasks({ noCache: false });
      const duration = res.durationMs || 1;
      setLastWarmMs(duration);

      const entry = {
        id: Date.now(),
        type: "Warm Query (Cache Hit)",
        status: res.cacheStatus || "HIT",
        durationMs: duration,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory((prev) => [entry, ...prev.slice(0, 9)]);
      await refreshStats();
      onToast?.(`Warm cache query completed in ${duration}ms (${res.cacheStatus || "HIT"})`, "success");
    } catch (err) {
      onToast?.(err.message || "Warm query failed", "error");
    } finally {
      setRunningBenchmark(false);
    }
  };

  // Run Automated Comparative Benchmark
  const runFullComparison = async () => {
    try {
      setRunningBenchmark(true);
      onToast?.("Initiating side-by-side performance benchmark...", "info");

      // 1. Invalidate cache to ensure cold start
      await clearCache();

      // 2. Cold query
      const coldRes = await getTasks({ noCache: false });
      const coldTime = coldRes.durationMs || 1;
      setLastColdMs(coldTime);

      // 3. Warm query (should be cached)
      const warmRes = await getTasks({ noCache: false });
      const warmTime = warmRes.durationMs || 1;
      setLastWarmMs(warmTime);

      const speedup = warmTime > 0 ? (coldTime / warmTime).toFixed(1) : "N/A";

      setHistory((prev) => [
        {
          id: Date.now() + 1,
          type: "Warm Query (Cache Hit)",
          status: warmRes.cacheStatus || "HIT",
          durationMs: warmTime,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Date.now(),
          type: "Cold Query (Initial Load)",
          status: coldRes.cacheStatus || "MISS",
          durationMs: coldTime,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 8),
      ]);

      await refreshStats();
      onToast?.(
        `Benchmark finished: cache hit was ${speedup}x faster than cold database read.`,
        "success"
      );
    } catch (err) {
      onToast?.(err.message || "Benchmark failed", "error");
    } finally {
      setRunningBenchmark(false);
    }
  };

  // Invalidate Cache manually
  const handleInvalidateCache = async () => {
    try {
      setRunningBenchmark(true);
      await clearCache();
      await refreshStats();
      onToast?.("Task cache key invalidated successfully.", "info");
    } catch (err) {
      onToast?.(err.message || "Failed to invalidate cache", "error");
    } finally {
      setRunningBenchmark(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance & Cache Diagnostics</h1>
          <p className="page-subtitle">
            In-memory caching with 60-second TTL, automatic write invalidation, and response-time benchmarking.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={refreshStats} />

      {/* Live Cache Metrics Cards */}
      <div className="grid-4">
        <MetricCard
          title="Cache Hit Ratio"
          value={stats?.hitRatio || "0.0%"}
          badge="In-Memory"
          subtext={`${stats?.hits || 0} hits of ${stats?.totalRequests || 0} requests`}
          color="#34d399"
        />

        <MetricCard
          title="Cache Hits"
          value={stats?.hits ?? 0}
          badge="RAM"
          subtext="Served directly from NodeCache"
          color="#67e8f9"
        />

        <MetricCard
          title="Cache Misses"
          value={stats?.misses ?? 0}
          badge="Database"
          subtext="Fetched from MongoDB Atlas"
          color="#fbbf24"
        />

        <MetricCard
          title="Standard TTL"
          value={`${stats?.stdTTL || 60}s`}
          badge="Expiry"
          subtext={`${stats?.cachedKeysCount || 0} active keys`}
          color="#a5b4fc"
        />
      </div>

      {/* Benchmark Control Panel */}
      <div className="card">
        <div className="card-title">
          <span>Cache Benchmark Suite</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={refreshStats}
              disabled={loadingStats || runningBenchmark}
              className="btn btn-sm btn-secondary"
            >
              Refresh
            </button>
            <button
              onClick={handleInvalidateCache}
              disabled={runningBenchmark}
              className="btn btn-sm btn-danger"
              title="Delete the active cache key"
            >
              Invalidate Cache
            </button>
          </div>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Test the latency difference between cold database queries and warm memory reads. The server reports cache state via the <code>X-Cache: HIT</code> and <code>X-Cache: MISS</code> response headers.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <button
            onClick={runFullComparison}
            disabled={runningBenchmark}
            className="btn btn-primary"
          >
            Run Comparison Benchmark
          </button>
          <button
            onClick={runColdQuery}
            disabled={runningBenchmark}
            className="btn btn-secondary"
          >
            Test Cold Query (Miss)
          </button>
          <button
            onClick={runWarmQuery}
            disabled={runningBenchmark}
            className="btn btn-secondary"
          >
            Test Warm Query (Hit)
          </button>
        </div>

        {/* Latency Comparison Visualizer */}
        {(lastColdMs !== null || lastWarmMs !== null) && (
          <div
            style={{
              background: "var(--bg-card-subtle)",
              padding: "1.15rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
              Measured Latency Comparison
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {/* Cold DB Query */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--warning)", fontWeight: 600 }}>
                    Cold Database Query (Cache Miss):
                  </span>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {lastColdMs !== null ? `${lastColdMs} ms` : "Not tested yet"}
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-main)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      background: "var(--warning)",
                    }}
                  />
                </div>
              </div>

              {/* Warm Cache Hit */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>
                    Warm In-Memory Read (Cache Hit):
                  </span>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {lastWarmMs !== null ? `${lastWarmMs} ms` : "Not tested yet"}
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-main)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width:
                        lastColdMs && lastWarmMs
                          ? `${Math.max(4, Math.min(100, (lastWarmMs / lastColdMs) * 100))}%`
                          : "20%",
                      background: "var(--success)",
                    }}
                  />
                </div>
              </div>

              {lastColdMs && lastWarmMs && (
                <div
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--text-primary)",
                    marginTop: "0.4rem",
                    padding: "0.45rem 0.65rem",
                    background: "var(--success-light)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  ⚡ Cache hit executed in <strong>{lastWarmMs}ms</strong> vs <strong>{lastColdMs}ms</strong> for MongoDB Atlas — approximately <strong>{(lastColdMs / Math.max(1, lastWarmMs)).toFixed(1)}x faster</strong>.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Execution History Table */}
        <div>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
            Recent Benchmark Runs
          </h3>
          {history.length === 0 ? (
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              No runs recorded yet. Click one of the buttons above to test.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Query Type</th>
                    <th>Header</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.775rem" }}>
                        {entry.timestamp}
                      </td>
                      <td style={{ fontWeight: 500 }}>{entry.type}</td>
                      <td>
                        <span
                          className={`badge ${
                            entry.status === "HIT" ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {entry.durationMs} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cache Invalidation Architecture Card */}
      <div className="card">
        <div className="card-title">
          <span>Cache Invalidation Architecture</span>
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <p style={{ marginBottom: "0.5rem" }}>
            TaskFlow keeps memory and the persistent database in sync through write-time cache invalidation:
          </p>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li>
              <strong>Read Path (<code>GET /tasks</code>):</strong> Checks key <code>tasks:&lt;userId&gt;</code>. Returns cached payload immediately upon hit (HTTP header <code>X-Cache: HIT</code>). On miss, queries MongoDB Atlas, populates cache with 60-second TTL, and responds with <code>X-Cache: MISS</code>.
            </li>
            <li>
              <strong>Write Path (<code>POST /tasks</code>, <code>PUT /tasks/:id</code>, <code>DELETE /tasks/:id</code>):</strong> Executes the database mutation, emits the asynchronous notification event, and automatically executes <code>cache.del("tasks:&lt;userId&gt;")</code>, ensuring fresh task lists on the next request.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PerformanceLab;
