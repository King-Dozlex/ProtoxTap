import { useState } from "react";
import { NavLink, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { logout, type User } from "../services/api";

export default function AdminLayout() {
  const user = useOutletContext<User>();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setError("");
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not log out.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <header className="topbar">
        <NavLink className="brand" to="/admin" aria-label="ProtoxTap Admin home">
          <span className="brand-mark">P</span>
          <span>Protox<span className="brand-light">Tap</span><small>ADMIN</small></span>
        </NavLink>
        <div className="account-area">
          <span className="account-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
          <span className="account-name">{user.username}</span>
          <button className="button button-quiet button-small" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>
      <aside className="side-panel">
        <span className="side-label">WORKSPACE</span>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink end to="/admin"><span className="nav-icon" aria-hidden="true">01</span>Dashboard</NavLink>
          <NavLink to="/admin/businesses"><span className="nav-icon" aria-hidden="true">02</span>Businesses</NavLink>
          <NavLink to="/admin/cards"><span className="nav-icon" aria-hidden="true">03</span>Cards</NavLink>
        </nav>
        <div className="side-note"><span className="live-indicator"><i /> All systems ready</span><p>Manage your review cards and the businesses they support.</p></div>
      </aside>
      <main className="main-content">
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <Outlet />
      </main>
      <footer className="footer"><span>PROTOXTAP</span><span>Business operations</span></footer>
    </div>
  );
}
