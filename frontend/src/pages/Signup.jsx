import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";
import { AuthShell } from "./Login.jsx";

export default function Signup() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!f.name.trim() || !f.email.trim() || !f.password || !f.confirm) return setErr("All fields are required.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    if (f.password !== f.confirm) return setErr("Passwords do not match.");
    setLoading(true);
    try {
      await signup({ name: f.name.trim(), email: f.email.trim(), password: f.password });
      nav("/login");
    } catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell title="Create your account" subtitle="Start analyzing ultrasound images with Sono AI.">
      <form onSubmit={submit} noValidate>
        <label>Full name<input value={f.name} onChange={set("name")} placeholder="Your name" /></label>
        <label>Email<input type="email" value={f.email} onChange={set("email")} placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={f.password} onChange={set("password")} /></label>
        <label>Confirm password<input type="password" value={f.confirm} onChange={set("confirm")} /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn block" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
      </form>
      <p className="muted center">Already registered? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}
