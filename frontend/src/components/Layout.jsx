import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FilePlus2, History, LogOut, Menu, X, Waves } from "lucide-react";
import { clearToken } from "../services/api";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/new", label: "New Examination", icon: FilePlus2 },
  { to: "/history", label: "Examination History", icon: History },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const logout = () => { clearToken(); nav("/login"); };
  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="brand"><Waves size={20} /> Sono AI</span>
      </header>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand brand-lg"><span className="logo"><Waves size={20} /></span> Sono AI</div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button className="nav-link logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
