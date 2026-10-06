import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import { getExamination, downloadReport } from "../services/api";
import { LoadingSpinner, PredictionCard, Disclaimer, fmtDate } from "../components/Ui.jsx";

const Field = ({ k, v }) => <div className="field"><span className="muted">{k}</span><strong>{v}</strong></div>;

export default function ExaminationDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [e, setE] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { getExamination(id).then(setE).catch((x) => setErr(x.message)); }, [id]);
  if (err && !e) return <div className="error">{err}</div>;
  if (!e) return <LoadingSpinner text="Loading examination..." />;
  return (
    <>
      <h1>Examination #{e.id}</h1>
      <div className="two-col">
        <div className="card">
          <h3>Patient information</h3>
          <Field k="Examination ID" v={`#${e.id}`} />
          <Field k="Date" v={fmtDate(e.created_at)} />
          <Field k="Patient" v={e.patient_name} />
          <Field k="Age" v={e.patient_age} />
          <Field k="Gender" v={e.patient_gender} />
          <Field k="Contact" v={e.patient_contact} />
          <Field k="Image reference" v={e.image_path || "—"} />
        </div>
        <PredictionCard prediction={e.prediction} confidence={e.confidence} />
      </div>
      {err && <div className="error">{err}</div>}
      <div className="row gap wrap">
        <button className="btn" onClick={() => downloadReport(e.id).catch((x) => setErr(x.message))}><Download size={16} /> Download PDF Report</button>
        <button className="btn ghost" onClick={() => nav("/history")}><ArrowLeft size={16} /> Back to History</button>
      </div>
      <Disclaimer />
    </>
  );
}
