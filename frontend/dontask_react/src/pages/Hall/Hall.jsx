import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectProvider, useProject } from "./HallContext.jsx";
import Navbar from "../Home/components/Navbar/Navbar.jsx";
import Boards from "./Components/Boards/Boards.jsx";
import Info from "./Components/Info/Info.jsx";
import Footer from "./Components/HallFooter/HallFooter.jsx";
import { fetchWithAuth } from "../../service/api.js";
import "./Hall.css";
import "../../fonts/fonts.css";

const HallContent = () => {
  const { projectId } = useParams();
  const { setProjectData, setLoading } = useProject();

  useEffect(() => {
    if (projectId) {
      localStorage.setItem("lastVisitedProjectId", projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setProjectData(null);
      try {
        const response = await fetchWithAuth(
          `/GetPages/GetHallPage/${projectId}`
        );
        console.log("Данные досок получены:", response);
        setProjectData(response);
      } catch (err) {
        console.error("Ошибка при загрузке данных проекта:", err);
        setProjectData(null);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, setProjectData, setLoading]);

  return (
    <div className="hall-content-wrapper">
      <div className="hall-main-content">
        <Boards />
        <Info />
      </div>
      <div className="hall-footer">
        <Footer />
      </div>
    </div>
  );
};

export default function Hall() {
  return (
    <div className="hall-container">
      <Navbar />
      <ProjectProvider>
        <HallContent />
      </ProjectProvider>
    </div>
  );
}
