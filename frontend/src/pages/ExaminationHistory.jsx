import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileX } from "lucide-react";
import { getExaminations, downloadReport } from "../services/api";
import { LoadingSpinner, PredictionBadge, ExaminationCard, fmtDate } from "../components/Ui.jsx";

export default function ExaminationHistory() {
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => { getExaminations().then(setItems).catch((e) => setErr(e.message)); }, []);
  const dl = (id) => downloadReport(id).catch((e) => setErr(e.message));
  const view = (id) => nav(`/examinations/${id}`);
  if (err && !items) return <div className="error">{err}</div>;
  if (!items) return <LoadingSpinner text="Loading examinations..." />;
  const rows = items
    .filter((i) => filter === "all" || i.prediction === filter)
    .filter((i) => i.patient_name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return (
    <>
      <h1>Examination History</h1>
      {err && <div className="error">{err}</div>}
      <div className="row gap wrap toolbar">
        <div className="search"><Search size={16} /><input placeholder="Search patient..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">
          {["all", "benign", "malignant", "normal"].map((f) => (
            <button key={f} className={`chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="card empty"><FileX size={36} /><p>No examinations found.</p></div>
      ) : (
        <>
          <div className="card table-wrap desktop-only">
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Age</th><th>Gender</th><th>Prediction</th><th>Confidence</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td>#{e.id}</td><td>{e.patient_name}</td><td>{e.patient_age}</td><td>{e.patient_gender}</td>
                    <td><PredictionBadge value={e.prediction} /></td>
                    <td>{Number(e.confidence).toFixed(1)}%</td><td>{fmtDate(e.created_at)}</td>
                    <td className="row gap">
                      <button className="btn sm" onClick={() => view(e.id)}>View</button>
                      <button className="btn ghost sm" onClick={() => dl(e.id)}>Download Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid-cards mobile-only">
            {rows.map((e) => <ExaminationCard key={e.id} exam={e} onView={view} onDownload={dl} />)}
          </div>
        </>
      )}
    </>
  );
}
