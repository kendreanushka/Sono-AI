export const API_BASE_URL = "https://sono-ai-backend-d61c.onrender.com";
const KEY = "sonoai_token";
export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

async function request(path, { auth = true, ...opts } = {}) {
  const headers = { ...(opts.headers || {}) };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  } catch {
    throw new Error("Unable to connect to Sono AI server.");
  }
  if (res.status === 401 && auth) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    let detail = "";
    try { const d = await res.json(); if (typeof d.detail === "string") detail = d.detail; } catch {}
    const e = new Error(detail || "Something went wrong. Please try again.");
    e.status = res.status;
    throw e;
  }
  return res;
}

export async function signup({ name, email, password }) {
  try {
    const r = await request("/auth/signup", {
      auth: false, method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return r.json();
  } catch (e) {
    if (e.status === 400 || e.status === 409) throw new Error("Email already registered");
    throw e;
  }
}

export async function login(email, password) {
  try {
    const r = await request("/auth/login", {
      auth: false, method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    });
    const data = await r.json();
    setToken(data.access_token);
    return data;
  } catch (e) {
    if (e.status === 400 || e.status === 401 || e.status === 422) throw new Error("Invalid email or password");
    throw e;
  }
}

export async function predictImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  try {
    return await (await request("/predict", { method: "POST", body: fd })).json();
  } catch (e) {
    if (e.message.startsWith("Unable to connect") || e.message.startsWith("Session")) throw e;
    throw new Error("Unable to analyze image. Please try again.");
  }
}

export async function saveExamination(d) {
  const r = await request("/examinations", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      patient_name: d.patient_name, patient_age: String(d.patient_age),
      patient_gender: d.patient_gender, patient_contact: d.patient_contact,
      prediction: d.prediction, confidence: String(d.confidence), image_path: d.image_path,
    }),
  });
  return r.json();
}

export const getExaminations = async () => (await request("/examinations")).json();
export const getExamination = async (id) => (await request(`/examinations/${id}`)).json();

export async function downloadReport(id) {
  const r = await request(`/examinations/${id}/report`);
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url; a.download = `sono-ai-report-${id}.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
