import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./pages/Landing/Landing";
import AuthPage from "./pages/Authentication/Auth";
import HomePage from "./pages/Home/Home";
import WorkspacePage from "./pages/Workspace/Workspace";
import SettingsPage from "./pages/Settings/Settings";
import HallPage from "./pages/Hall/Hall";
import { ToastProvider } from "./components/Toast/ToastContext";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        navigate("/auth/login");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workspace/:boardId" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/hall/:projectId" element={<HallPage />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
