import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { predictImage, saveExamination, downloadReport } from "../services/api";
import { UploadZone, PredictionCard } from "../components/Ui.jsx";

const empty = { patient_name: "", patient_age: "", patient_gender: "Female", patient_contact: "" };

export default function NewExamination() {
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const choose = (f) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setSavedId(null); setErr(""); };
  const remove = () => { setFile(null); setPreview(""); setResult(null); setSavedId(null); };

  const analyze = async () => {
    setErr("");
    if (!form.patient_name.trim() || !form.patient_age || !form.patient_contact.trim()) return setErr("Please complete all patient fields.");
    if (Number(form.patient_age) < 0 || Number(form.patient_age) > 120) return setErr("Enter a valid age.");
    if (!file) return setErr("Please upload an ultrasound image.");
    setBusy("predict");
    try { setResult(await predictImage(file)); }
    catch (e) { setErr(e.message); }
    finally { setBusy(""); }
  };

  const save = async () => {
    setBusy("save"); setErr("");
    try {
      const r = await saveExamination({
        ...form, prediction: result.prediction, confidence: result.confidence,
        image_path: `uploads/${file.name}`,
      });
      setSavedId(r.examination_id);
    } catch (e) { setErr(e.message); }
    finally { setBusy(""); }
  };

  return (
    <>
      <h1>New Examination</h1>
      <p className="muted">Enter patient details and upload a breast ultrasound image.</p>
      <div className="two-col">
        <div className="card">
          <h3>Patient information</h3>
          <label>Patient name<input value={form.patient_name} onChange={set("patient_name")} /></label>
          <div className="row gap">
            <label className="grow">Age<input type="number" min="0" max="120" value={form.patient_age} onChange={set("patient_age")} /></label>
            <label className="grow">Gender
              <select value={form.patient_gender} onChange={set("patient_gender")}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </label>
          </div>
          <label>Contact<input value={form.patient_contact} onChange={set("patient_contact")} /></label>
        </div>
        <div className="card">
          <UploadZone file={file} preview={preview} onFile={choose} onRemove={remove} />
          {busy === "predict" ? (
            <div className="loading"><span className="spinner" />Analyzing ultrasound image...</div>
          ) : (
            <button className="btn block" onClick={analyze} disabled={!!busy}>Analyze Image</button>
          )}
        </div>
      </div>
      {err && <div className="error">{err}</div>}
      {result && (
        <div className="result-wrap">
          <PredictionCard prediction={result.prediction} confidence={result.confidence} />
          {savedId ? (
            <div className="card saved">
              <h3>Examination saved</h3>
              <p>Examination ID: <strong>#{savedId}</strong></p>
              <div className="row gap">
                <button className="btn" onClick={() => nav(`/examinations/${savedId}`)}>View Examination</button>
                <button className="btn ghost" onClick={() => downloadReport(savedId).catch((e) => setErr(e.message))}>Download Report</button>
              </div>
            </div>
          ) : (
            <button className="btn" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Saving examination..." : "Save Examination"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
