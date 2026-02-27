import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminPanel } from "./pages/AdminPanel";
import { LoginPage } from "./pages/LoginPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;