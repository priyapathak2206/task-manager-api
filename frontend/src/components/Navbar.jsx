import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <NavLink to="/" className="nav-brand">
          <div className="nav-logo">TF</div>
          <span>TaskFlow</span>
        </NavLink>

        {/* Simplified Navigation: Only Dashboard, Tasks, Projects, Activity */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink to="/activity" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Activity
            </NavLink>
          </li>
        </ul>

        {/* Right: Profile Menu or Login */}
        <div className="nav-profile-container" ref={dropdownRef}>
          {user ? (
            <div>
              <button
                type="button"
                className="nav-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                title="User menu"
              >
                {!avatarError ? (
                  <img
                    src="/images/avatar.jpg"
                    alt="Priya Pathak"
                    className="user-avatar"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="user-avatar">PP</div>
                )}
                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email ? user.email.split("@")[0] : "Account"}
                </span>
                <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>▼</span>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown" style={{ minWidth: "180px", width: "auto" }}>
                  <div className="dropdown-header">
                    <div className="dropdown-user-email">{user.email}</div>
                    <div className="dropdown-user-role">Authenticated User</div>
                  </div>

                  <button
                    type="button"
                    className="dropdown-item"
                    style={{ color: "#f87171" }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                      navigate("/account");
                    }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link to="/account" className="btn btn-sm btn-primary">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
