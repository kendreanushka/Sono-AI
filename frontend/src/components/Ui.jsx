import { useRef, useState } from "react";
import { UploadCloud, X, ShieldAlert } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }) {
  return <div className="loading"><span className="spinner" />{text}</div>;
}

export function StatCard({ label, value, icon: Icon, tone = "blue" }) {
  return (
    <div className="card stat">
      <span className={`stat-icon tone-${tone}`}><Icon size={20} /></span>
      <div><div className="stat-value">{value}</div><div className="muted">{label}</div></div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="disclaimer">
      <ShieldAlert size={18} />
      <span>AI-generated result for educational/research purposes only. This system is not a medical diagnostic tool.</span>
    </div>
  );
}

export const PredictionBadge = ({ value }) => (
  <span className={`badge pred-${value}`}>{value}</span>
);

export function PredictionCard({ prediction, confidence }) {
  const pct = Math.max(0, Math.min(100, Number(confidence) || 0));
  return (
    <div className={`card result pred-${prediction}`}>
      <div className="muted label">AI Classification</div>
      <div className="result-label">{String(prediction).toUpperCase()}</div>
      <div className="muted label">Model confidence</div>
      <div className="result-conf">{pct.toFixed(1)}%</div>
      <div className="bar"><div style={{ width: `${pct}%` }} /></div>
      <Disclaimer />
    </div>
  );
}

export function UploadZone({ file, preview, onFile, onRemove }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const pick = (f) => {
    if (f && /^image\/(png|jpe?g)$/.test(f.type)) onFile(f);
  };
  if (file) {
    return (
      <div className="upload filled">
        <img src={preview} alt="Ultrasound preview" />
        <div className="file-row">
          <div><strong>{file.name}</strong><div className="muted">{(file.size / 1024).toFixed(1)} KB</div></div>
          <button className="btn ghost sm" type="button" onClick={onRemove}><X size={14} /> Replace</button>
        </div>
      </div>
    );
  }
  return (
    <div className={`upload ${drag ? "drag" : ""}`} onClick={() => ref.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}>
      <UploadCloud size={40} />
      <h3>Upload Ultrasound Image</h3>
      <p className="muted">PNG / JPG / JPEG — drag and drop or click to browse</p>
      <input ref={ref} type="file" accept="image/png,image/jpeg" hidden
        onChange={(e) => pick(e.target.files[0])} />
    </div>
  );
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export function ExaminationCard({ exam, onView, onDownload }) {
  return (
    <div className="card exam-card">
      <div className="row between">
        <strong>{exam.patient_name}</strong><PredictionBadge value={exam.prediction} />
      </div>
      <div className="muted">#{exam.id} · {exam.patient_age} · {exam.patient_gender} · {fmtDate(exam.created_at)}</div>
      <div>Confidence: <strong>{Number(exam.confidence).toFixed(1)}%</strong></div>
      <div className="row gap">
        <button className="btn sm" onClick={() => onView(exam.id)}>View</button>
        <button className="btn ghost sm" onClick={() => onDownload(exam.id)}>Download Report</button>
      </div>
    </div>
  );
}
