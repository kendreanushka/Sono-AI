import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Waves, Activity, ShieldCheck } from "lucide-react";
import { login } from "../services/api";
import { Disclaimer } from "../components/Ui.jsx";

export const AuthShell = ({ title, subtitle, children }) => (
  <div className="auth">
    <section className="auth-hero">
      <div className="brand brand-lg"><span className="logo"><Waves size={20} /></span> Sono AI</div>
      <h1>AI-assisted breast ultrasound classification.</h1>
      <p>Upload an ultrasound image and receive a benign / malignant / normal classification with model confidence, then keep a secure examination history with PDF reports.</p>
      <div className="scan">
        <div className="scan-line" />
        <Activity size={64} />
      </div>
      <div className="row gap muted-light"><ShieldCheck size={16} /> Educational & research prototype</div>
    </section>
    <section className="auth-form">
      <div className="auth-box">
        <h2>{title}</h2><p className="muted">{subtitle}</p>
        {children}
        <Disclaimer />
      </div>
    </section>
  </div>
);

export default function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!f.email.trim() || !f.password) return setErr("Email and password are required.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    setLoading(true);
    try { await login(f.email.trim(), f.password); nav("/"); }
    catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Sono AI.">
      <form onSubmit={submit} noValidate>
        <label>Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn block" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
      <p className="muted center">New here? <Link to="/signup">Create an account</Link></p>
    </AuthShell>
  );
}
