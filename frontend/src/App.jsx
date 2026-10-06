import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./services/api";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewExamination from "./pages/NewExamination.jsx";
import ExaminationHistory from "./pages/ExaminationHistory.jsx";
import ExaminationDetails from "./pages/ExaminationDetails.jsx";

function Protected({ children }) {
  return getToken() ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}
function Public({ children }) {
  return getToken() ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/signup" element={<Public><Signup /></Public>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/new" element={<Protected><NewExamination /></Protected>} />
      <Route path="/history" element={<Protected><ExaminationHistory /></Protected>} />
      <Route path="/examinations/:id" element={<Protected><ExaminationDetails /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
