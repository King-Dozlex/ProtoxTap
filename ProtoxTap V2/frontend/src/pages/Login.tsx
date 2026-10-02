import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => { if (active) setAuthenticated(Boolean(user)); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to check your session.");
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  if (authenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      setPassword("");
      navigate("/admin", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-aside">
        <div className="login-brand"><span className="brand-mark">P</span><span>Protox<span className="brand-light">Tap</span></span></div>
        <div className="login-aside-copy"><span className="eyebrow">OPERATIONS CONSOLE</span><h1>Keep every<br />tap in good hands.</h1><p>Manage your businesses and review cards from one clear workspace.</p></div>
        <span className="login-aside-foot">PROTOXTAP / ADMINISTRATION</span>
      </div>
      <section className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p className="form-intro">Use your administrator account to continue.</p>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          {checking ? <div className="inline-loading">Checking your session...</div> : <>
            <label className="field"><span>Username</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label className="field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="button button-primary login-submit" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign in"}
            </button>
          </>}
          <span className="login-note">Administrator access only</span>
        </form>
      </section>
    </main>
  );
}
