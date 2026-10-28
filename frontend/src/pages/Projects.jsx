import React, { useState, useEffect, useCallback } from "react";
import { getGithubRepos, getGithubProfile } from "../api";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Projects() {
  const [username, setUsername] = useState("priyapathak2206");
  const [activeQuery, setActiveQuery] = useState("priyapathak2206");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const fetchRepositories = useCallback(async (targetUser) => {
    try {
      setLoading(true);
      setError(null);
      const [repoData, profileData] = await Promise.all([
        getGithubRepos(targetUser),
        getGithubProfile(targetUser).catch(() => null),
      ]);
      setRepos(repoData || []);
      setProfile(profileData);
    } catch (err) {
      setError(err.message || "Failed to load repositories from GitHub.");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories(activeQuery);
  }, [activeQuery, fetchRepositories]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setActiveQuery(username.trim());
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Repositories</h1>
          <p className="page-subtitle">
            Explore public code repositories fetched live from GitHub.
          </p>
        </div>
      </div>

      {/* Developer Profile Header Card with Real Avatar */}
      <div className="profile-banner">
        {!avatarError ? (
          <img
            src={activeQuery === "priyapathak2206" ? "/images/avatar.jpg" : profile?.avatar_url || "/images/avatar.jpg"}
            alt="Priya Pathak"
            className="profile-avatar-lg"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div
            className="profile-avatar-lg"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "white",
              background: "var(--primary)",
            }}
          >
            PP
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {profile?.name || (activeQuery === "priyapathak2206" ? "Priya Pathak" : activeQuery)}
            </h2>
            <a
              href={`https://github.com/${activeQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.85rem", color: "var(--primary)" }}
            >
              @{activeQuery} ↗
            </a>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            {profile?.bio || "Software Developer • GitHub: @priyapathak2206"}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span><strong>{repos.length}</strong> public repositories</span>
            {profile?.followers !== undefined && <span><strong>{profile.followers}</strong> followers</span>}
          </div>
        </div>

        {/* Quick User Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username"
            style={{ width: "160px", padding: "0.45rem 0.65rem", fontSize: "0.825rem" }}
          />
          <button type="submit" className="btn btn-sm btn-secondary" disabled={loading}>
            Search
          </button>
        </form>
      </div>

      <ErrorMessage
        message={error}
        onRetry={() => fetchRepositories(activeQuery)}
      />

      {loading ? (
        <Spinner label={`Fetching repositories for @${activeQuery}...`} />
      ) : repos.length === 0 && !error ? (
        <div className="card empty-state">
          <div className="empty-state-title">No Public Repositories</div>
          <div className="empty-state-desc">
            No public repositories were found for user <strong>@{activeQuery}</strong>.
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 0,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                      wordBreak: "break-word",
                    }}
                  >
                    {repo.name} ↗
                  </a>
                  {repo.fork && <span className="badge badge-subtle">Fork</span>}
                </div>

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                    lineHeight: 1.5,
                  }}
                >
                  {repo.description || "No description provided."}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                  fontSize: "0.775rem",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
                  {repo.language && (
                    <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                      ● {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                </div>

                <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
