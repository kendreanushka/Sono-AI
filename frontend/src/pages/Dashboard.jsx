import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, AlertTriangle, Heart, ArrowRight } from "lucide-react";
import { getExaminations, downloadReport } from "../services/api";
import { LoadingSpinner, StatCard, ExaminationCard } from "../components/Ui.jsx";

export default function Dashboard() {
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { getExaminations().then(setItems).catch((e) => setErr(e.message)); }, []);
  const dl = (id) => downloadReport(id).catch((e) => setErr(e.message));
  if (err && !items) return <div className="error">{err}</div>;
  if (!items) return <LoadingSpinner text="Loading examinations..." />;
  const count = (p) => items.filter((i) => i.prediction === p).length;
  const recent = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  return (
    <>
      <h1>Welcome back</h1>
      <p className="muted">Analyze breast ultrasound images with AI-assisted classification.</p>
      {err && <div className="error">{err}</div>}
      <div className="grid4">
        <StatCard label="Total Examinations" value={items.length} icon={Activity} />
        <StatCard label="Benign" value={count("benign")} icon={CheckCircle2} tone="green" />
        <StatCard label="Malignant" value={count("malignant")} icon={AlertTriangle} tone="red" />
        <StatCard label="Normal" value={count("normal")} icon={Heart} tone="cyan" />
      </div>
      <div className="card cta">
        <div><h2>Start New Examination</h2><p>Upload an ultrasound image and enter patient details to get an AI classification.</p></div>
        <Link className="btn light" to="/new">Analyze Ultrasound <ArrowRight size={16} /></Link>
      </div>
      <h2>Recent Examinations</h2>
      {recent.length === 0 ? <p className="muted">No examinations yet.</p> :
        <div className="grid-cards">{recent.map((e) => <ExaminationCard key={e.id} exam={e} onView={(id) => nav(`/examinations/${id}`)} onDownload={dl} />)}</div>}
    </>
  );
}
