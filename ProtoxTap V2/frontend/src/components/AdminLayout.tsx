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
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/businesses">Businesses</NavLink>
          <NavLink to="/admin/cards">Cards</NavLink>
        </nav>
        <div className="account-area">
          <span className="account-name">{user.username}</span>
          <button className="button button-quiet button-small" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>
      <main className="main-content">
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <Outlet />
      </main>
      <footer className="footer"><span>PROTOXTAP</span><span>Business operations</span></footer>
    </div>
  );
}